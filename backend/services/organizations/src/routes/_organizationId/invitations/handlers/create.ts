import { RouteHandlerMethod } from 'fastify';
import { IInvitationsRepository } from '../../../../repositories/invitations/IInvitationsRepository';
import { ApiError } from '@falkordb/errors';
import { CreateInvitationService } from '../services/CreateInvitationService';
import { IMessagingRepository } from '../../../../repositories/messaging/IMessagingRepository';
import { IOrganizationsRepository } from '../../../../repositories/organizations/IOrganizationsRepository';
import {
  CreateOrganizationInvitationRequestBodyType,
  CreateOrganizationInvitationRequestHeadersType,
  CreateOrganizationInvitationRequestParamsType,
  CreateOrganizationInvitationResponseSchemaType,
} from '@falkordb/schemas/src/services/organizations/v1';

export const createInvitationHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Headers: CreateOrganizationInvitationRequestHeadersType;
    Params: CreateOrganizationInvitationRequestParamsType;
    Body: CreateOrganizationInvitationRequestBodyType;
    Reply: CreateOrganizationInvitationResponseSchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };
  const invitationsRepository = request.diScope.resolve<IInvitationsRepository>(IInvitationsRepository.repositoryName);
  const messagingRepository = request.diScope.resolve<IMessagingRepository>(IMessagingRepository.repositoryName);
  const organizationsRepository = request.diScope.resolve<IOrganizationsRepository>(
    IOrganizationsRepository.repositoryName,
  );

  const service = new CreateInvitationService(
    opts,
    invitationsRepository,
    organizationsRepository,
    messagingRepository,
  );
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
};
