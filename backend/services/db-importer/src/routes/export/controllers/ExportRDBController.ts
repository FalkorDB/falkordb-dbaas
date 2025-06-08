import { FastifyBaseLogger } from "fastify";
import { OmnistrateRepository } from "../../../repositories/omnistrate/OmnistrateRepository";
import { ITasksDBRepository } from "../../../repositories/tasks";
import { K8sRepository } from "../../../repositories/k8s/K8sRepository";
import { OmnistrateInstanceSchemaType } from "../../../schemas/omnistrate-instance";
import { ExportRDBTaskType, MultiShardRDBExportPayloadType, RDBExportTaskPayloadType, SingleShardRDBExportPayloadType, TaskDocumentType, TaskTypesType } from "@falkordb/schemas/global";
import assert from "assert";
import { ApiError } from "@falkordb/errors";
import { ITaskQueueRepository } from "../../../repositories/tasksQueue/ITaskQueueRepository";


export class ExportRDBController {

  constructor(
    private tasksRepository: ITasksDBRepository,
    private omnistrateRepository: OmnistrateRepository,
    private k8sRepository: K8sRepository,
    private taskQueueRepository: ITaskQueueRepository,
    private _exportBucketName: string,
    private _opts: {
      logger: FastifyBaseLogger;
    },) {
    assert(_exportBucketName, 'ExportRDBController: exportBucketName is required');
  }

  private _resolvePodPrefix(instance: OmnistrateInstanceSchemaType): string {
    switch (instance.deploymentType) {
      case 'Standalone':
        return 'node-s';
      case 'Single-Zone':
        return 'node-sz';
      case 'Multi-Zone':
        return 'node-mz';
      case 'Cluster-Single-Zone':
        return 'cluster-sz';
      case 'Cluster-Multi-Zone':
        return 'cluster-mz';
      default:
        return 'node-f';
    }
  }

  private _getTaskType(instance: OmnistrateInstanceSchemaType): TaskTypesType {
    switch (instance.deploymentType) {
      case 'Standalone':
      case 'Single-Zone':
      case 'Multi-Zone':
        return 'SingleShardRDBExport';
      case 'Cluster-Single-Zone':
      case 'Cluster-Multi-Zone':
        return 'MultiShardRDBExport';
      default:
        return 'SingleShardRDBExport';
    }
  }

  private _createTaskPayload(
    taskType: TaskTypesType,
    instance: OmnistrateInstanceSchemaType,
    podId: string,
  ): RDBExportTaskPayloadType {
    if (taskType === 'SingleShardRDBExport') {
      return {
        instanceId: instance.id,
        podId,
        cloudProvider: instance.cloudProvider,
        clusterId: instance.clusterId,
        region: instance.region,
        hasTLS: instance.tls,
        destination: {
          bucketName: this._exportBucketName,
          fileName: `exports/${instance.id}/${crypto.randomUUID()}.rdb`,
          expiresIn: 60 * 60 * 1000, // 1 hour
        }
      } as SingleShardRDBExportPayloadType;
    }
    if (taskType === 'MultiShardRDBExport') {
      const pods = [0, 2, 4].map((i) => `${this._resolvePodPrefix(instance)}-${i}`);
      return {
        instanceId: instance.id,
        cloudProvider: instance.cloudProvider,
        clusterId: instance.clusterId,
        region: instance.region,
        hasTLS: instance.tls,
        destination: {
          nodes: pods.map((podId) => ({
            podId,
            partFileName: `exports/${instance.id}/${podId}.rdb`,
          })),
          fileName: `exports/${instance.id}/${crypto.randomUUID()}.rdb`,
          bucketName: this._exportBucketName,
          expiresIn: 60 * 60 * 1000, // 1 hour
        }
      } as MultiShardRDBExportPayloadType;
    }
  }

  async _getPendingExportTasks(instanceId: string): Promise<TaskDocumentType[]> {
    try {
      const tasks = await this.tasksRepository.listTasks(instanceId, {
        page: 1,
        pageSize: 1,
        status: ['created', 'pending', 'in_progress'],
        types: ['SingleShardRDBExport', 'MultiShardRDBExport']
      }).then((result) => result.data);
      // filter out expired tasks
      const now = Date.now();
      const pendingTasks = tasks.filter((task) => {
        return (new Date(task.createdAt).getTime() + 60 * 60 * 1000) > now; // 1 hour
      });
      return pendingTasks;
    } catch (error) {
      this._opts.logger.error({ error }, 'Error getting pending tasks');
      throw ApiError.internalServerError("Error getting pending tasks", 'PENDING_TASKS_ERROR');
    }
  }

  async exportRDB({
    requestorId,
    instanceId,
    username,
    password,
  }: {
    requestorId: string;
    instanceId: string;
    username: string;
    password: string;
  }): Promise<{ taskId: string }> {

    // Get instance details from omnistrate
    let instance: OmnistrateInstanceSchemaType | undefined;
    try {
      instance = await this.omnistrateRepository.getInstance(instanceId);
    } catch (error) {
      console.error(error);
      this._opts.logger.error({ error }, 'Error getting instance');
      throw ApiError.internalServerError("Error getting instance", 'INSTANCE_ERROR');
    }

    const hasAccess = await this.omnistrateRepository.checkIfUserHasAccessToInstance(requestorId, instance);

    if (!hasAccess) {
      throw ApiError.unauthorized("User does not have access to this instance", 'USER_NOT_AUTHORIZED');
    }

    // Verify if the instance is running
    // Verify it's not BYOA

    if (!instance) {
      throw ApiError.notFound("Instance not found", 'INSTANCE_NOT_FOUND');
    }
    if (instance.status !== "RUNNING") {
      throw ApiError.badRequest("Instance is not running", 'INSTANCE_NOT_RUNNING');
    }
    if (instance.productTierName === 'FalkorDB BYOA') {
      throw ApiError.badRequest("BYOA instances are not supported", 'BYOA_NOT_SUPPORTED');
    }

    const pendingTasks = await this._getPendingExportTasks(instanceId);
    if (pendingTasks.length > 0) {
      throw ApiError.conflict("There is already a task in progress", 'TASK_IN_PROGRESS');
    }

    const podId = `${this._resolvePodPrefix(instance)}-0`;

    // Validate credentials with k8s repository
    let isAdmin = false;
    try {
      isAdmin = await this.k8sRepository.isUserAdmin(
        instance.cloudProvider,
        instance.clusterId,
        instance.region,
        instanceId,
        podId,
        username,
        password,
        instance.tls,
      )
    } catch (error) {
      this._opts.logger.error({ error }, 'Error validating credentials');
      console.error(error)
      throw ApiError.internalServerError("Error validating credentials", 'CREDENTIALS_ERROR');
    }

    if (!isAdmin) {
      throw ApiError.unauthorized("Invalid credentials", 'INVALID_CREDENTIALS');
    }

    const taskType = this._getTaskType(instance);

    // Create a task in the tasks repository
    let task: ExportRDBTaskType | undefined;
    try {
      task = await this.tasksRepository.createTask(taskType,
        this._createTaskPayload(taskType, instance, podId),
      ) as ExportRDBTaskType;
    } catch (error) {
      this._opts.logger.error({ error }, 'Error creating task');
      throw ApiError.internalServerError("Error creating task", 'TASK_CREATION_ERROR');
    }

    try {
      await this.taskQueueRepository.submitExportRDBTask(task);
    } catch (error) {
      this._opts.logger.error({ error }, 'Error submitting task');
      this.tasksRepository.updateTask({
        taskId: task.taskId,
        status: 'failed',
        error: 'Error submitting task',
      });
      throw ApiError.internalServerError("Error submitting task", 'TASK_SUBMISSION_ERROR');
    }

    try {
      await this.tasksRepository.updateTask({
        taskId: task.taskId,
        status: 'pending',
      });
    } catch (error) {
      this._opts.logger.error({ error }, 'Error updating task status');
    }

    // Return the task ID
    return {
      taskId: task.taskId,
    };
  }
}