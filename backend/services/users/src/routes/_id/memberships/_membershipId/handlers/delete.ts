import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { IMembershipsRepository } from '../../../../../repositories/membership/IMembershipsRepository';
import { DeleteUserMembershipRequestParamsSchemaType } from '@falkordb/schemas/src/services/users/v1';

export const deleteMembershipHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: DeleteUserMembershipRequestParamsSchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<IMembershipsRepository>(IMembershipsRepository.repositoryName);

  try {
    const response = await repository.delete(request.params.membershipId);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
