import { diContainer } from '@fastify/awilix';
import { asClass, asFunction, Lifetime } from 'awilix';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { IOmnistrateRepository } from './repositories/omnistrate/IOmnistrateRepository';
import { OmnistrateRepository } from './repositories/omnistrate/OmnistrateRepository';
import { ICommitRepository } from './repositories/commit/ICommitRepository';
import { CommitRepositoryMock } from './repositories/commit/CommitRepositoryMock';
import { IMailRepository } from './repositories/mail/IMailRepository';
import { MailRepository } from './repositories/mail/MailRepository';

export const setupGlobalContainer = (fastify: FastifyInstance) => {
  diContainer.register({
    [IOmnistrateRepository.repositoryName]: asFunction(() => {
      return new OmnistrateRepository(
        fastify.config.OMNISTRATE_USER,
        fastify.config.OMNISTRATE_PASSWORD,
        fastify.config.OMNISTRATE_SERVICE_ID,
        fastify.config.OMNISTRATE_ENVIRONMENT_ID,
        fastify.config.OMNISTRATE_FREE_PRODUCT_TIER_ID,
        fastify.config.OMNISTRATE_CREATE_FREE_INSTANCE_PATH,
        fastify.config.OMNISTRATE_FREE_RESOURCE_ID,
        fastify.config.OMNISTRATE_SERVICE_ACCOUNT_SECRET,
      );
    }),

    [ICommitRepository.repositoryName]: asFunction(() => {
      return new CommitRepositoryMock();
    }),

    [IMailRepository.repositoryName]: asFunction(() => {
      return new MailRepository(fastify.config.BREVO_API_KEY);
    }),
  });
};

export const setupContainer = (req: FastifyRequest) => {
  diContainer.register({});
};
