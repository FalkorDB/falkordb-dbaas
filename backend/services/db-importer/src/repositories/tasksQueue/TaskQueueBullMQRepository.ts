import { ExportRDBTaskType, MultiShardRDBExportPayloadType } from "@falkordb/schemas/global";
import { FastifyBaseLogger } from "fastify";
import { FlowChildJob, FlowJob, FlowProducer, JobsOptions } from 'bullmq';
import { Static, TSchema } from "@sinclair/typebox";
import { ExporterSchemaMap, ExporterTaskNames } from "@falkordb/schemas/services/db-importer-worker/v1";
import { Value } from "@sinclair/typebox/value";
import { assert } from "console";

export class TaskQueueBullMQRepository {

  private _producer: FlowProducer;

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
  ) {
    this._producer = new FlowProducer({
      connection: {
        url: process.env.REDIS_URL,
      },
    });
  }

  _makeJobNode<T extends TSchema>(
    name: ExporterTaskNames,
    schema: T,
    data: Static<T>,
    opts: JobsOptions = { failParentOnFailure: true },
    children?: FlowChildJob[],
  ): FlowJob {
    this._opts.logger.debug(`Creating job node ${name} with data: ${JSON.stringify(data, null, 2)}`);
    Value.Assert(schema, data);
    return {
      name: name,
      queueName: name,
      data,
      children,
      opts,
    }
  }

  _createSingleShardRDBExportFlow(
    task: ExportRDBTaskType,
  ): FlowJob {
    this._opts.logger.debug(`Creating single shard RDB export flow for task: ${task.taskId}`);
    return this._makeJobNode(
      ExporterTaskNames.RdbExportCopyRdbToBucket,
      ExporterSchemaMap[ExporterTaskNames.RdbExportCopyRdbToBucket],
      {
        taskId: task.taskId,
        cloudProvider: task.payload.cloudProvider,
        clusterId: task.payload.clusterId,
        region: task.payload.region,
        instanceId: task.payload.instanceId,
        podId: task.payload.podId,
        bucketName: task.payload.destination.bucketName,
        fileName: task.payload.destination.fileName,
      },
      {
        failParentOnFailure: true,
      },
      [
        this._makeJobNode(
          ExporterTaskNames.RdbExportRequestReadSignedURL,
          ExporterSchemaMap[ExporterTaskNames.RdbExportRequestReadSignedURL],
          {
            taskId: task.taskId,
            bucketName: task.payload.destination.bucketName,
            fileName: task.payload.destination.fileName,
            expiresIn: task.payload.destination.expiresIn,
          },
          {
            failParentOnFailure: true,
          },
          [
            this._makeJobNode(
              ExporterTaskNames.RdbExportMonitorSaveProgress,
              ExporterSchemaMap[ExporterTaskNames.RdbExportMonitorSaveProgress],
              {
                taskId: task.taskId,
                podId: task.payload.podId,
                cloudProvider: task.payload.cloudProvider,
                clusterId: task.payload.clusterId,
                region: task.payload.region,
                instanceId: task.payload.instanceId,
                hasTLS: task.payload.hasTLS,
              },
              {
                failParentOnFailure: true,
              },
              [
                this._makeJobNode(
                  ExporterTaskNames.RdbExportSendSaveCommand,
                  ExporterSchemaMap[ExporterTaskNames.RdbExportSendSaveCommand],
                  {
                    taskId: task.taskId,
                    podId: task.payload.podId,
                    cloudProvider: task.payload.cloudProvider,
                    clusterId: task.payload.clusterId,
                    region: task.payload.region,
                    instanceId: task.payload.instanceId,
                    hasTLS: task.payload.hasTLS,
                  },
                  {
                    failParentOnFailure: true,
                  }
                )
              ]
            )
          ]
        )
      ]
    )
  }

  _createMultiShardRDBExportFlow(
    task: ExportRDBTaskType,
  ): FlowJob {
    this._opts.logger.debug(`Creating multi shard RDB export flow for task: ${task.taskId}`);

    const _makePodJob = (node: { podId: string, partFileName: string }): FlowJob => {


      return this._makeJobNode(
        ExporterTaskNames.RdbExportCopyRdbToBucket,
        ExporterSchemaMap[ExporterTaskNames.RdbExportCopyRdbToBucket],
        {
          taskId: task.taskId,
          cloudProvider: task.payload.cloudProvider,
          clusterId: task.payload.clusterId,
          region: task.payload.region,
          instanceId: task.payload.instanceId,
          podId: node.podId,
          bucketName: task.payload.destination.bucketName,
          fileName: node.partFileName,
        },
        {
          failParentOnFailure: true,
        },
        [
          this._makeJobNode(
            ExporterTaskNames.RdbExportRequestReadSignedURL,
            ExporterSchemaMap[ExporterTaskNames.RdbExportRequestReadSignedURL],
            {
              taskId: task.taskId,
              bucketName: task.payload.destination.bucketName,
              fileName: node.partFileName,
              expiresIn: task.payload.destination.expiresIn,
            },
            {
              failParentOnFailure: true,
            },
            [
              this._makeJobNode(
                ExporterTaskNames.RdbExportMonitorSaveProgress,
                ExporterSchemaMap[ExporterTaskNames.RdbExportMonitorSaveProgress],
                {
                  taskId: task.taskId,
                  podId: node.podId,
                  cloudProvider: task.payload.cloudProvider,
                  clusterId: task.payload.clusterId,
                  region: task.payload.region,
                  instanceId: task.payload.instanceId,
                  hasTLS: task.payload.hasTLS,
                },
                {
                  failParentOnFailure: true,
                },
                [
                  this._makeJobNode(
                    ExporterTaskNames.RdbExportSendSaveCommand,
                    ExporterSchemaMap[ExporterTaskNames.RdbExportSendSaveCommand],
                    {
                      taskId: task.taskId,
                      podId: node.podId,
                      cloudProvider: task.payload.cloudProvider,
                      clusterId: task.payload.clusterId,
                      region: task.payload.region,
                      instanceId: task.payload.instanceId,
                      hasTLS: task.payload.hasTLS,
                    },
                    {
                      failParentOnFailure: true,
                    }
                  )
                ]
              )
            ]
          )
        ]
      )
    }

    return this._makeJobNode(
      ExporterTaskNames.RdbExportRequestReadSignedURL,
      ExporterSchemaMap[ExporterTaskNames.RdbExportRequestReadSignedURL],
      {
        taskId: task.taskId,
        bucketName: task.payload.destination.bucketName,
        fileName: task.payload.destination.fileName,
        expiresIn: task.payload.destination.expiresIn,
      },
      {
        failParentOnFailure: true,
      },
      [
        this._makeJobNode(
          ExporterTaskNames.RdbExportMonitorRDBMerge,
          ExporterSchemaMap[ExporterTaskNames.RdbExportMonitorRDBMerge],
          {
            taskId: task.taskId,
            cloudProvider: task.payload.cloudProvider,
            projectId: process.env.CTRL_PLANE_PROJECT_ID,
            clusterId: process.env.CTRL_PLANE_CLUSTER_ID,
            region: process.env.CTRL_PLANE_REGION,
            namespace: process.env.NAMESPACE,
          },
          {
            failParentOnFailure: true
          },
          [
            this._makeJobNode(
              ExporterTaskNames.RdbExportRequestRDBMerge,
              ExporterSchemaMap[ExporterTaskNames.RdbExportRequestRDBMerge],
              {
                taskId: task.taskId,
                cloudProvider: task.payload.cloudProvider,
                projectId: process.env.CTRL_PLANE_PROJECT_ID,
                clusterId: process.env.CTRL_PLANE_CLUSTER_ID,
                region: process.env.CTRL_PLANE_REGION,
                namespace: process.env.NAMESPACE,
                bucketName: task.payload.destination.bucketName,
                outputRdbFileName: task.payload.destination.fileName,
                rdbFileNames: (task.payload as MultiShardRDBExportPayloadType).destination.nodes.map(node => node.partFileName),
              },
              { failParentOnFailure: true },
              (task.payload as MultiShardRDBExportPayloadType).destination.nodes.map(node => _makePodJob(node)),
            )
          ]
        )
      ]
    )
  }

  _createFlow(
    task: ExportRDBTaskType,
  ): FlowJob {
    switch (task.type) {
      case 'SingleShardRDBExport':
        return this._createSingleShardRDBExportFlow(task);
      case 'MultiShardRDBExport':
        return this._createMultiShardRDBExportFlow(task);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async submitTask(
    task: ExportRDBTaskType,
  ): Promise<void> {
    assert(process.env.CTRL_PLANE_PROJECT_ID, 'CTRL_PLANE_PROJECT_ID is not set');
    assert(process.env.CTRL_PLANE_CLUSTER_ID, 'CTRL_PLANE_CLUSTER_ID is not set');
    assert(process.env.CTRL_PLANE_REGION, 'CTRL_PLANE_REGION is not set');
    assert(process.env.NAMESPACE, 'NAMESPACE is not set');
    const flow = this._createFlow(task)
    this._opts.logger.debug(`Submitting task ${task.taskId} to queue: ${JSON.stringify(flow, null, 2)}`);
    await this._producer.add(
      flow,
    )
  }
}