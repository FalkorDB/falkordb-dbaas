import { RouteHandlerMethod } from 'fastify';
import {
  DeleteOrganizationRequestParamsType,
} from '../schemas/organization';
import { IOrganizationsRepository } from '../../../../repositories/organizations/IOrganizationsRepository';
import { ApiError } from '@falkordb/errors';
import { DeleteOrganizationService } from '../services/DeleteOrganizationService';
import { IMembersRepository } from '../../../../repositories/members/IMembersRepository';

export const deleteOrganizationHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: DeleteOrganizationRequestParamsType;
  }
> = async (request) => {
  const _opts = { logger: request.log };
  const organizationsRepository = request.diScope.resolve<IOrganizationsRepository>(
    IOrganizationsRepository.repositoryName,
  );
  const membersRepository = request.diScope.resolve<IMembersRepository>(IMembersRepository.repositoryName);

  const service = new DeleteOrganizationService(_opts, organizationsRepository, membersRepository);

  try {
    return await service.execute(request.params.id);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
