import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import {
  ListUsersResponseSchemaType,
  InstanceIdParamSchemaType,
  SubscriptionIdQuerySchemaType,
} from '../../../../schemas/users';
import { IK8sRepository } from '../../../../repositories/k8s/IK8sRepository';
import { ILdapRepository } from '../../../../repositories/ldap/ILdapRepository';
import { IConnectionCacheRepository } from '../../../../repositories/connection-cache/IConnectionCacheRepository';
import { UserService } from '../../../../services/UserService';

export const listUsersHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: InstanceIdParamSchemaType;
    Querystring: SubscriptionIdQuerySchemaType;
    Reply: ListUsersResponseSchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };
  const sessionData = request.sessionData;

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

    const users = await userService.listUsers(
      sessionData.instanceId,
      sessionData.cloudProvider,
      sessionData.k8sClusterName,
      sessionData.region,
    );

    return { users };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    request.log.error({ error }, 'Error listing users');
    throw request.server.httpErrors.createError(500, error.message || 'Internal Server Error', {
      error,
    });
  }
};
