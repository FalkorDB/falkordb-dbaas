import { diContainer } from '@fastify/awilix';
import { asClass, asFunction, Lifetime } from 'awilix';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { IOmnistrateRepository } from './repositories/omnistrate/IOmnistrateRepository';
import { OmnistrateRepository } from './repositories/omnistrate/OmnistrateRepository';
import { ICommitRepository } from './repositories/commit/ICommitRepository';
import { CommitRepositoryMock } from './repositories/commit/CommitRepositoryMock';
import { IMailRepository } from './repositories/mail/IMailRepository';
import { MailRepository } from './repositories/mail/MailRepository';
import { CommitRepository } from './repositories/commit/CommitRepository';

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
        fastify.config.OMNISTRATE_SERVICE_ACCOUNT_SECRET,
        {
          dryRun: fastify.config.DRY_RUN,
          logger: fastify.log,
        },
      );
    }),

    [ICommitRepository.repositoryName]: asFunction(() => {
      if (process.env.NODE_ENV === 'test') {
        return new CommitRepositoryMock();
      }
      return new CommitRepository(fastify.config.COMMIT_BACKEND_BASE_URL, {
        dryRun: fastify.config.DRY_RUN,
        logger: fastify.log,
      });
    }),

    [IMailRepository.repositoryName]: asFunction(() => {
      return new MailRepository(fastify.config.BREVO_API_KEY, {
        dryRun: fastify.config.DRY_RUN,
        logger: fastify.log,
      });
    }),
  });
};

export const setupContainer = (req: FastifyRequest) => {
  diContainer.register({});
};
