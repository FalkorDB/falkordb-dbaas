import { RouteHandlerMethod } from "fastify";
import { ImportRDBConfirmUploadRequestBody, ImportRDBConfirmUploadResponseBody, } from '@falkordb/schemas/services/import-export-rdb/v1';
import { ApiError } from "@falkordb/errors";
import { ImportRDBController } from "../controllers/ImportRDBController";
import { OmnistrateRepository } from "../../../repositories/omnistrate/OmnistrateRepository";
import { K8sRepository } from "../../../repositories/k8s/K8sRepository";
import { decode, JwtPayload } from 'jsonwebtoken';
import { IBlobStorageRepository } from "../../../repositories/blob/IBlobStorageRepository";
import { ITasksDBRepository } from "../../../repositories/tasks";
import { ITaskQueueRepository } from "../../../repositories/tasksQueue/ITaskQueueRepository";

export const importRDBConfirmUploadHandler: RouteHandlerMethod<undefined, undefined, undefined, {
  Body: ImportRDBConfirmUploadRequestBody,
  Reply: ImportRDBConfirmUploadResponseBody,
}> = async (request, reply) => {
  const {
    instanceId,
    taskId,
  } = request.body;

  const logger = request.log;

  const omnistrateRepository = request.diScope.resolve<OmnistrateRepository>(OmnistrateRepository.name);
  const k8sRepository = request.diScope.resolve<K8sRepository>(K8sRepository.name);
  const tasksRepository = request.diScope.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const storageRepository = request.diScope.resolve<IBlobStorageRepository>(IBlobStorageRepository.name);
  const taskQueueRepository = request.diScope.resolve<ITaskQueueRepository>(ITaskQueueRepository.name);

  const controller = new ImportRDBController(
    omnistrateRepository,
    k8sRepository,
    tasksRepository,
    storageRepository,
    taskQueueRepository,
    process.env.IMPORT_BUCKET_NAME,
    {
      logger,
    }
  );

  try {
    const { userID } = decode(((request.headers as unknown)?.['authorization'] as string)?.split(' ').pop()) as JwtPayload;
    await controller.confirmUpload({
      requestorId: userID,
      taskId,
      instanceId,
    });

    reply.status(202).send({
      taskId,
    });
  } catch (error) {
    logger.error(error, "Error creating RDB import task");

    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw error;
  }
}