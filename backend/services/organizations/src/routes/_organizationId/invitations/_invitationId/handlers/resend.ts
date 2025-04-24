import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { ResendOrganizationInvitationRequestParamsType } from '@falkordb/schemas/services/organizations/v1';
import { IInvitationsRepository } from '../../../../../repositories/invitations/IInvitationsRepository';
import { ResendInvitationService } from '../services/ResendInvitationService';
import { IOrganizationsRepository } from '../../../../../repositories/organizations/IOrganizationsRepository';
import { IMessagingRepository } from '../../../../../repositories/messaging/IMessagingRepository';

export const resendInvitationHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: ResendOrganizationInvitationRequestParamsType;
  }
> = async (request) => {
  const opts = { logger: request.log };

  const invitationsRepository = request.diScope.resolve<IInvitationsRepository>(IInvitationsRepository.repositoryName);
  const messagingRepository = request.diScope.resolve<IMessagingRepository>(IMessagingRepository.repositoryName);
  const organizationsRepository = request.diScope.resolve<IOrganizationsRepository>(
    IOrganizationsRepository.repositoryName,
  );

  const service = new ResendInvitationService(
    opts,
    invitationsRepository,
    organizationsRepository,
    messagingRepository,
  );

  try {
    return await service.resend(request.params.invitationId);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
