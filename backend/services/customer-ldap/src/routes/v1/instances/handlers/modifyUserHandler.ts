import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import {
  ModifyUserRequestSchemaType,
  ModifyUserResponseSchemaType,
  UsernameParamSchemaType,
  SubscriptionIdQuerySchemaType,
} from '../../../../schemas/users';
import { IK8sRepository } from '../../../../repositories/k8s/IK8sRepository';
import { ILdapRepository } from '../../../../repositories/ldap/ILdapRepository';
import { IConnectionCacheRepository } from '../../../../repositories/connection-cache/IConnectionCacheRepository';
import { UserService } from '../../../../services/UserService';

export const modifyUserHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: UsernameParamSchemaType;
    Querystring: SubscriptionIdQuerySchemaType;
    Body: ModifyUserRequestSchemaType;
    Reply: ModifyUserResponseSchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };
  const sessionData = request.sessionData;
  const { username } = request.params;
  const userData = request.body;

  try {
    // Execute the user operation
    const k8sRepository = request.diScope.resolve<IK8sRepository>(IK8sRepository.repositoryName);
    const ldapRepository = request.diScope.resolve<ILdapRepository>(
      ILdapRepository.repositoryName,
    );
    const connectionCache = request.diScope.resolve<IConnectionCacheRepository>(
      IConnectionCacheRepository.repositoryName,
    );

    const userService = new UserService(opts, k8sRepository, ldapRepository, connectionCache);

    await userService.modifyUser(
      sessionData.instanceId,
      sessionData.cloudProvider,
      sessionData.k8sClusterName,
      sessionData.region,
      username,
      userData,
    );

    return { message: 'User modified successfully' };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    request.log.error({ error }, 'Error modifying user');
    throw request.server.httpErrors.createError(500, error.message || 'Internal Server Error', {
      error,
    });
  }
};
