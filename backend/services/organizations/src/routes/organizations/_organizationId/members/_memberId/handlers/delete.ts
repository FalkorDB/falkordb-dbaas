import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { DeleteMemberRequestParamsType } from '@falkordb/schemas/src/services/organizations/v1';
import { IMembersRepository } from '../../../../../../repositories/members/IMembersRepository';

export const deleteMemberHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: DeleteMemberRequestParamsType;
  }
> = async (request) => {
  const membersRepository = request.diScope.resolve<IMembersRepository>(IMembersRepository.repositoryName);

  try {
    return await membersRepository.delete(request.params.memberId);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
