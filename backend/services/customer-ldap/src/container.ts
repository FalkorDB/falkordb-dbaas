import { diContainer } from '@fastify/awilix';
import { asFunction } from 'awilix';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { IOmnistrateRepository } from './repositories/omnistrate/IOmnistrateRepository';
import { OmnistrateRepository } from './repositories/omnistrate/OmnistrateRepository';
import { OmnistrateClient, IOmnistrateClient } from './repositories/omnistrate/OmnistrateClient';
import { IK8sRepository } from './repositories/k8s/IK8sRepository';
import { K8sRepository } from './repositories/k8s/K8sRepository';
import { IK8sCredentialsRepository } from './repositories/k8s-credentials/IK8sCredentialsRepository';
import { K8sCredentialsOmnistrateRepository } from './repositories/k8s-credentials/K8sCredentialsOmnistrateRepository';
import { ILdapRepository } from './repositories/ldap/ILdapRepository';
import { LdapRepository } from './repositories/ldap/LdapRepository';
import { ISessionRepository } from './repositories/session/ISessionRepository';
import { SessionRepository } from './repositories/session/SessionRepository';
import { IConnectionCacheRepository } from './repositories/connection-cache/IConnectionCacheRepository';
import { ConnectionCacheRepository } from './repositories/connection-cache/ConnectionCacheRepository';
import { GcpServiceAccountValidator } from './services/GcpServiceAccountValidator';

export const setupGlobalContainer = (fastify: FastifyInstance) => {
  diContainer.register({
    [IOmnistrateClient.repositoryName]: asFunction(() => {
      return new OmnistrateClient(
        fastify.config.OMNISTRATE_EMAIL,
        fastify.config.OMNISTRATE_PASSWORD,
        { logger: fastify.log },
      );
    }).singleton(),

    [IOmnistrateRepository.repositoryName]: asFunction(() => {
      const omnistrateClient = fastify.diContainer.resolve<OmnistrateClient>(IOmnistrateClient.repositoryName);
      return new OmnistrateRepository(
        omnistrateClient,
        fastify.config.OMNISTRATE_SERVICE_ID,
        fastify.config.OMNISTRATE_ENVIRONMENT_ID,
        { logger: fastify.log },
      );
    }).singleton(),

    [ISessionRepository.repositoryName]: asFunction(() => {
      return new SessionRepository(fastify.config.JWT_SECRET, { logger: fastify.log });
    }).singleton(),

    [IConnectionCacheRepository.repositoryName]: asFunction(() => {
      return new ConnectionCacheRepository({ logger: fastify.log });
    }).singleton(),

    // Register repositories as singletons for worker access
    [IK8sRepository.repositoryName]: asFunction(() => {
      return new K8sRepository({ logger: fastify.log });
    }).singleton(),

    [IK8sCredentialsRepository.repositoryName]: asFunction(() => {
      const omnistrateClient = fastify.diContainer.resolve<OmnistrateClient>(IOmnistrateClient.repositoryName);
      return new K8sCredentialsOmnistrateRepository(omnistrateClient, { logger: fastify.log });
    }).singleton(),

    [ILdapRepository.repositoryName]: asFunction(() => {
      return new LdapRepository({ logger: fastify.log });
    }).singleton(),

    [GcpServiceAccountValidator.serviceName]: asFunction(() => {
      return new GcpServiceAccountValidator({
        logger: fastify.log,
        adminServiceAccountEmail: fastify.config.GCP_ADMIN_SERVICE_ACCOUNT_EMAIL,
        audience: fastify.config.GCP_SERVICE_ACCOUNT_TOKEN_AUDIENCE,
      });
    }).singleton(),
  });
};

export const setupContainer = (req: FastifyRequest) => {
  // Request-scoped repositories with request-specific logger
  // These override the global singletons for the duration of the request
  req.diScope.register({
    [IK8sRepository.repositoryName]: asFunction(() => {
      return new K8sRepository({ logger: req.log });
    }).scoped(),

    [IK8sCredentialsRepository.repositoryName]: asFunction(() => {
      const omnistrateClient = req.server.diContainer.resolve<OmnistrateClient>(IOmnistrateClient.repositoryName);
      return new K8sCredentialsOmnistrateRepository(omnistrateClient, { logger: req.log });
    }).scoped(),

    [ILdapRepository.repositoryName]: asFunction(() => {
      return new LdapRepository({ logger: req.log });
    }).scoped(),
  });
};
