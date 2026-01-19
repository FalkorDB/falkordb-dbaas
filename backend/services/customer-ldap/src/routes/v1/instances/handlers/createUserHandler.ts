import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import {
  CreateUserRequestSchemaType,
  CreateUserResponseSchemaType,
  InstanceIdParamSchemaType,
  SubscriptionIdQuerySchemaType,
} from '../../../../schemas/users';
import { IK8sRepository } from '../../../../repositories/k8s/IK8sRepository';
import { IK8sCredentialsRepository } from '../../../../repositories/k8s-credentials/IK8sCredentialsRepository';
import { ILdapRepository } from '../../../../repositories/ldap/ILdapRepository';
import { IConnectionCacheRepository } from '../../../../repositories/connection-cache/IConnectionCacheRepository';
import { UserService } from '../../../../services/UserService';

export const createUserHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: InstanceIdParamSchemaType;
    Querystring: SubscriptionIdQuerySchemaType;
    Body: CreateUserRequestSchemaType;
    Reply: CreateUserResponseSchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };
  const sessionData = request.sessionData;
  const userData = request.body;

  try {
    // Execute the user operation
    const k8sRepository = request.diScope.resolve<IK8sRepository>(IK8sRepository.repositoryName);
    const k8sCredentialsRepository = request.diScope.resolve<IK8sCredentialsRepository>(
      IK8sCredentialsRepository.repositoryName,
    );
    const ldapRepository = request.diScope.resolve<ILdapRepository>(
      ILdapRepository.repositoryName,
    );
    const connectionCache = request.diScope.resolve<IConnectionCacheRepository>(
      IConnectionCacheRepository.repositoryName,
    );

    const userService = new UserService(opts, k8sRepository, k8sCredentialsRepository, ldapRepository, connectionCache);

    await userService.createUser(
      sessionData.instanceId,
      sessionData.cloudProvider,
      sessionData.k8sClusterName,
      sessionData.region,
      userData,
    );

    return { message: 'User created successfully' };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    request.log.error({ error }, 'Error creating user');
    throw request.server.httpErrors.createError(500, 'Internal Server Error');
  }
};
