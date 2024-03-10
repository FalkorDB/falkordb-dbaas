import { RouteHandlerMethod } from "fastify";
import { CreateInvitationRequestBodyType, CreateInvitationRequestHeadersType, CreateInvitationRequestParamsType, CreateInvitationResponseSchemaType } from "../schemas/invitations";
import { IInvitationsRepository } from "../../../../../repositories/invitations/IInvitationsRepository";
import { ApiError } from "@falkordb/errors";
import { CreateInvitationService } from "../services/CreateInvitationService";


export const createInvitationHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Headers: CreateInvitationRequestHeadersType;
    Params: CreateInvitationRequestParamsType;
    Body: CreateInvitationRequestBodyType;
    Reply: CreateInvitationResponseSchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };
  const invitationsRepository = request.diScope.resolve<IInvitationsRepository>(IInvitationsRepository.repositoryName);

  const service = new CreateInvitationService(opts, invitationsRepository);
  try {
    return await service.createInvitation({
      email: request.body.email,
      organizationId: request.params.organizationId,
      role: request.body.role,
      inviterId: request.headers['x-falkordb-userId'],
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
}