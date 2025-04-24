import { RouteHandlerMethod } from "fastify";
import { ListExportRDBTasksRequestQueryType, ListExportRDBTasksResponseType } from '@falkordb/schemas/services/import-export-rdb/v1';
import { ITasksDBRepository } from "../../../repositories/tasks";
import { ApiError } from "@falkordb/errors";
import { decode, JwtPayload } from 'jsonwebtoken';
import { OmnistrateRepository } from "../../../repositories/omnistrate/OmnistrateRepository";

export const listTasksHandler: RouteHandlerMethod<undefined, undefined, undefined, {
  Querystring: ListExportRDBTasksRequestQueryType,
  Reply: ListExportRDBTasksResponseType
}> = async (request, reply) => {

  const logger = request.log;
  const tasksRepository = request.diScope.resolve<ITasksDBRepository>(ITasksDBRepository.name);
  const omnistrateRepository = request.diScope.resolve<OmnistrateRepository>(OmnistrateRepository.name);

  const { page, pageSize, instanceId } = request.query;

  try {
    const { userID } = decode(((request.headers as unknown)?.['authorization'] as string)?.split(' ').pop()) as JwtPayload;
    const hasAccess = await omnistrateRepository.checkIfUserHasWriteAccessToInstance(userID, null, instanceId);
    if (!hasAccess) {
      throw ApiError.forbidden("You don't have access to this instance", "FORBIDDEN").toFastify(request.server);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    logger.error(error, "Error decoding token");
    throw ApiError.unauthorized("Invalid token", "INVALID_TOKEN").toFastify(request.server);
  }

  try {
    const data = await tasksRepository.listTasks(instanceId, {
      page,
      pageSize,
    });

    reply.send(data);
  } catch (error) {
    logger.error(error, "Error listing tasks");

    throw ApiError.internalServerError("Error listing tasks", "INTERNAL_ERROR").toFastify(request.server);
  }
}