import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import {
  UpdateOrganizationMemberRequestBodyType,
  UpdateOrganizationMemberRequestParamsType,
  UpdateOrganizationMemberResponseSchemaType,
} from '@falkordb/schemas/services/organizations/v1';
import { IMembersRepository } from '../../../../../repositories/members/IMembersRepository';

export const updateMemberHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: UpdateOrganizationMemberRequestParamsType;
    Body: UpdateOrganizationMemberRequestBodyType;
    Reply: UpdateOrganizationMemberResponseSchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<IMembersRepository>(IMembersRepository.repositoryName);

  try {
    return await repository.update(request.params.memberId, {
      role: request.body.role,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
