import { RawServerBase, RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import {
  ModifyUserRequestSchemaType,
  ModifyUserResponseSchemaType,
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

export const modifyUserHandler: RouteHandlerMethod<
  RawServerBase,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
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
    // The principal user's password must only be changed via the Omnistrate API
    // (which triggers the instance-updated webhook and syncs to LDAP automatically).
    // Block any attempt to modify it through the customer-ldap API.
    if (userData.password !== undefined) {
      const omnistrateRepository = request.diScope.resolve<IOmnistrateRepository>(
        IOmnistrateRepository.repositoryName,
      );
      const instance = await omnistrateRepository.getInstance(sessionData.instanceId);
      const principalUsername = instance.resultParams?.falkordbUser;
      if (principalUsername && username === principalUsername) {
        throw ApiError.forbidden(
          'The principal user password can only be changed via the Omnistrate API',
          'CANNOT_CHANGE_PRINCIPAL_USER_PASSWORD',
        );
      }
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
    throw request.server.httpErrors.createError(500, 'Internal Server Error');
  }
};
