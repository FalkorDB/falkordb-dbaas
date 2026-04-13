import { RawServerBase, RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import {
  DeleteUserResponseSchemaType,
  UsernameParamSchemaType,
  SubscriptionIdQuerySchemaType,
} from '../../../../schemas/users';
import { IK8sRepository } from '../../../../repositories/k8s/IK8sRepository';
import { IK8sCredentialsRepository } from '../../../../repositories/k8s-credentials/IK8sCredentialsRepository';
import { ILdapRepository } from '../../../../repositories/ldap/ILdapRepository';
import { IConnectionCacheRepository } from '../../../../repositories/connection-cache/IConnectionCacheRepository';
import { IOmnistrateRepository } from '../../../../repositories/omnistrate/IOmnistrateRepository';
import { UserService } from '../../../../services/UserService';
import { IncomingMessage, ServerResponse } from 'http';

export const deleteUserHandler: RouteHandlerMethod<
  RawServerBase,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  {
    Params: UsernameParamSchemaType;
    Querystring: SubscriptionIdQuerySchemaType;
    Reply: DeleteUserResponseSchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };
  const sessionData = request.sessionData;
  const { username } = request.params;

  try {
    // Check that the user being deleted is not the original instance user
    const omnistrateRepository = request.diScope.resolve<IOmnistrateRepository>(
      IOmnistrateRepository.repositoryName,
    );
    const instance = await omnistrateRepository.getInstance(sessionData.instanceId);
    const originalUsername = instance.resultParams?.falkordbUser;
    if (originalUsername && username === originalUsername) {
      throw ApiError.forbidden('Cannot delete the original instance user', 'CANNOT_DELETE_ORIGINAL_USER');
    }

    // Execute the user operation
    const k8sRepository = request.diScope.resolve<IK8sRepository>(IK8sRepository.repositoryName);
    const k8sCredentialsRepository = request.diScope.resolve<IK8sCredentialsRepository>(
      IK8sCredentialsRepository.repositoryName,
    );
    const ldapRepository = request.diScope.resolve<ILdapRepository>(ILdapRepository.repositoryName);
    const connectionCache = request.diScope.resolve<IConnectionCacheRepository>(
      IConnectionCacheRepository.repositoryName,
    );

    const userService = new UserService(opts, k8sRepository, k8sCredentialsRepository, ldapRepository, connectionCache);

    await userService.deleteUser(
      sessionData.instanceId,
      sessionData.cloudProvider,
      sessionData.k8sClusterName,
      sessionData.region,
      username,
    );

    return { message: 'User deleted successfully' };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    request.log.error({ error }, 'Error deleting user');
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    throw request.server.httpErrors.createError(500, message);
  }
};
