import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import {
  UpdateMemberRequestBodyType,
  UpdateMemberRequestParamsType,
  UpdateMemberResponseSchemaType,
} from '@falkordb/schemas/src/services/organizations/v1';
import { IMembersRepository } from '../../../../../repositories/members/IMembersRepository';

export const updateMemberHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: UpdateMemberRequestParamsType;
    Body: UpdateMemberRequestBodyType;
    Reply: UpdateMemberResponseSchemaType;
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
