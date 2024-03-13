import { RouteHandlerMethod } from 'fastify';
import {
  CreateOrganizationRequestBodyType,
  CreateOrganizationRequestHeadersType,
  CreateOrganizationResponseType,
} from '@falkordb/schemas/src/services/organizations/v1';
import { IOrganizationsRepository } from '../../repositories/organizations/IOrganizationsRepository';
import { CreateOrganizationService } from '../services/CreateOrganizationService';
import { ApiError } from '@falkordb/errors';
import { IMembersRepository } from '../../repositories/members/IMembersRepository';

export const createOrganizationsHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Headers: CreateOrganizationRequestHeadersType;
    Body: CreateOrganizationRequestBodyType;
    Reply: CreateOrganizationResponseType;
  }
> = async (request) => {
  const opts = { logger: request.log };

  const organizationsRepository = request.diScope.resolve<IOrganizationsRepository>(
    IOrganizationsRepository.repositoryName,
  );
  const membersRepository = request.diScope.resolve<IMembersRepository>(IMembersRepository.repositoryName);

  const service = new CreateOrganizationService(opts, organizationsRepository, membersRepository);

  try {
    return await service.create({ ...request.body, creatorUserId: request.headers['x-falkordb-userid'] });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
