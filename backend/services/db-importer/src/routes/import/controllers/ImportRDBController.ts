import { FastifyBaseLogger } from "fastify";
import { K8sRepository } from "../../../repositories/k8s/K8sRepository";
import { OmnistrateRepository } from "../../../repositories/omnistrate/OmnistrateRepository";
import assert from "assert";
import { IBlobStorageRepository } from "../../../repositories/blob/IBlobStorageRepository";
import { ITasksDBRepository } from "../../../repositories/tasks";
import { ApiError } from "@falkordb/errors";
import { OmnistrateInstanceSchemaType } from "../../../schemas/omnistrate-instance";
import { ImportRDBTaskType, RDBImportTaskPayloadType, TaskDocumentType } from "@falkordb/schemas/global";
import { ITaskQueueRepository } from "../../../repositories/tasksQueue/ITaskQueueRepository";
import crypto from "crypto";

export class ImportRDBController {


  constructor(
    private omnistrateRepository: OmnistrateRepository,
    private k8sRepository: K8sRepository,
    private tasksRepository: ITasksDBRepository,
    private storageRepository: IBlobStorageRepository,
    private taskQueueRepository: ITaskQueueRepository,
    private _importBucketName: string,
    private _opts: {
      logger: FastifyBaseLogger;
    },) {
    assert(_importBucketName, 'ImportRDBController: importBucketName is required');
  }


  async _getPendingImportTasks(instanceId: string): Promise<TaskDocumentType[]> {
    try {
      const tasks = await this.tasksRepository.listTasks(instanceId, {
        page: 1,
        pageSize: 1,
        status: ['created', 'pending', 'in_progress'],
        types: ['RDBImport']
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

  private _createTaskPayload(
    instance: OmnistrateInstanceSchemaType,
    deploymentSizeInMb: number
  ): RDBImportTaskPayloadType {
    const randomId = crypto.randomUUID();
    return {
      cloudProvider: instance.cloudProvider,
      region: instance.region,
      clusterId: instance.clusterId,
      instanceId: instance.id,
      podIds: instance.podIds,
      hasTLS: instance.tls,
      bucketName: this._importBucketName,
      fileName: `imports/${instance.id}/${randomId}.rdb`,
      rdbSizeFileName: `imports/${instance.id}/${randomId}-size.txt`,
      rdbKeyNumberFileName: `imports/${instance.id}/${randomId}-keys.txt`,
      deploymentSizeInMb: deploymentSizeInMb,
      aofEnabled: instance.aofEnabled,
      backupPath: instance.aofEnabled ? `/data/backup/appendonlydir` : `/data/backup/dump.rdb`,
      isCluster: instance.deploymentType.startsWith('Cluster'),
    }
  }

  private _convertMaxMemoryToMB(maxMemory: string | undefined): number {
    if (!maxMemory) {
      return 0;
    }
    const memoryInBytes = parseInt(maxMemory, 10);
    return Math.floor(memoryInBytes / (1024 * 1024)); // Convert bytes to MB
  }

  async requestUploadUrl(
    {
      requestorId,
      instanceId,
      username,
      password
    }: {
      requestorId: string;
      instanceId: string;
      username: string;
      password: string;
    }
  ): Promise<{ taskId: string, uploadUrl: string }> {

    // Get instance details from omnistrate
    let instance: OmnistrateInstanceSchemaType | undefined;
    try {
      instance = await this.omnistrateRepository.getInstance(instanceId);
    } catch (error) {
      this._opts.logger.error({ error }, 'Error getting instance');
      throw ApiError.internalServerError("Error getting instance", 'INSTANCE_ERROR');
    }

    const hasAccess = await this.omnistrateRepository.checkIfUserHasAccessToInstance(requestorId, instance);

    if (!hasAccess) {
      throw ApiError.unauthorized("User does not have access to this instance", 'USER_NOT_AUTHORIZED');
    }

    if (!instance) {
      throw ApiError.notFound("Instance not found", 'INSTANCE_NOT_FOUND');
    }
    if (instance.status !== "RUNNING") {
      throw ApiError.badRequest("Instance is not running", 'INSTANCE_NOT_RUNNING');
    }
    if (instance.productTierName === 'FalkorDB BYOA') {
      throw ApiError.badRequest("BYOA instances are not supported", 'BYOA_NOT_SUPPORTED');
    }

    const pendingTasks = await this._getPendingImportTasks(instanceId);
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
      throw ApiError.internalServerError("Error validating credentials", 'CREDENTIALS_ERROR');
    }

    if (!isAdmin) {
      throw ApiError.unauthorized("Invalid credentials", 'INVALID_CREDENTIALS');
    }


    let maxMemory: string | undefined;
    try {
      maxMemory = await this.k8sRepository.getMaxMemory(
        instance.cloudProvider,
        instance.clusterId,
        instance.region,
        instanceId,
        podId,
        instance.tls,
      )
    } catch (error) {
      this._opts.logger.error({ error }, 'Error getting max memory');
      throw ApiError.internalServerError("Error getting instance size", 'INSTANCE_SIZE_ERROR');
    }

    if (!maxMemory) {
      this._opts.logger.error('Max memory is not set for the instance');
      throw ApiError.internalServerError("Instance size is not set", 'INSTANCE_SIZE_NOT_SET');
    }

    let task: ImportRDBTaskType | undefined;
    const payload = this._createTaskPayload(instance, this._convertMaxMemoryToMB(maxMemory));
    try {
      task = await this.tasksRepository.createTask('RDBImport',
        payload,
      ) as ImportRDBTaskType;
    } catch (error) {
      this._opts.logger.error({ error }, 'Error creating task');
      throw ApiError.internalServerError("Error creating task", 'TASK_CREATION_ERROR');
    }

    const uploadUrl = await this.storageRepository.getWriteUrl(
      this._importBucketName,
      payload.fileName,
      'application/octet-stream',
      60 * 60, // 1 hour
    );

    await this.tasksRepository.updateTask({
      taskId: task.taskId,
      status: 'pending',
    });

    return {
      taskId: task.taskId,
      uploadUrl,
    }
  }

  async confirmUpload({
    requestorId,
    taskId,
    instanceId,
  }: {
    requestorId: string,
    taskId: string,
    instanceId: string,
  }): Promise<void> {
    // Check if the user has access to the instance
    const instance = await this.omnistrateRepository.getInstance(instanceId);
    if (!instance) {
      throw ApiError.notFound("Instance not found", 'INSTANCE_NOT_FOUND');
    }

    const hasAccess = await this.omnistrateRepository.checkIfUserHasAccessToInstance(requestorId, instance);
    if (!hasAccess) {
      throw ApiError.unauthorized("User does not have access to this instance", 'USER_NOT_AUTHORIZED');
    }

    // Check if the task exists
    const task = await this.tasksRepository.getTaskById(taskId) as ImportRDBTaskType;
    if (!task) {
      throw ApiError.notFound("Task not found", 'TASK_NOT_FOUND');
    }
    if (task.type !== 'RDBImport') {
      throw ApiError.badRequest("Invalid task", 'INVALID_TASK_TYPE');
    }

    // Check if the task is in a valid state
    if (task.status !== 'pending') {
      throw ApiError.badRequest("Task is not in a valid state", 'TASK_INVALID_STATE');
    }

    // Update the task status to in_progress
    await this.tasksRepository.updateTask({
      taskId,
      updatedAt: new Date().toISOString(),
    });

    await this.taskQueueRepository.submitImportRDBTask(task);
  }

}