import { diContainer } from '@fastify/awilix';
import { asFunction } from 'awilix';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { IOmnistrateRepository } from './repositories/omnistrate/IOmnistrateRepository';
import { OmnistrateRepository } from './repositories/omnistrate/OmnistrateRepository';
import { IK8sRepository } from './repositories/k8s/IK8sRepository';
import { K8sRepository } from './repositories/k8s/K8sRepository';
import { ILdapRepository } from './repositories/ldap/ILdapRepository';
import { LdapRepository } from './repositories/ldap/LdapRepository';
import { ISessionRepository } from './repositories/session/ISessionRepository';
import { SessionRepository } from './repositories/session/SessionRepository';
import { IConnectionCacheRepository } from './repositories/connection-cache/IConnectionCacheRepository';
import { ConnectionCacheRepository } from './repositories/connection-cache/ConnectionCacheRepository';

export const setupGlobalContainer = (fastify: FastifyInstance) => {
  diContainer.register({
    [IOmnistrateRepository.repositoryName]: asFunction(() => {
      return new OmnistrateRepository(
        fastify.config.OMNISTRATE_EMAIL,
        fastify.config.OMNISTRATE_PASSWORD,
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
  });
};

export const setupContainer = (req: FastifyRequest) => {
  req.diScope.register({
    [IK8sRepository.repositoryName]: asFunction(() => {
      return new K8sRepository({ logger: req.log });
    }).scoped(),

    [ILdapRepository.repositoryName]: asFunction(() => {
      return new LdapRepository({ logger: req.log });
    }).scoped(),
  });
};
