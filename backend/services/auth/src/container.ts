import { diContainer } from '@fastify/awilix';
import { asClass, asFunction, Lifetime } from 'awilix';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { IAuthRepository } from './repositories/auth/IAuthRepository';
import { AuthRepositoryIdentityPlatform } from './repositories/auth/AuthRepositoryIdentityPlatform';
import { ICaptchaRepository } from './repositories/captcha/ICaptchaRepository';
import { ReCaptchaRepository } from './repositories/captcha/ReCaptchaRepository';
import { AuthRepositoryMock } from './repositories/auth/AuthRepositoryMock';
import { CaptchaRepositoryMock } from './repositories/captcha/CaptchaRepositoryMock';
import { IUsersRepository } from './repositories/users/IUsersRepository';
import { UsersRepositoryFalkorDBClient } from './repositories/users/UsersRepositoryFalkorDBClient';
import { IMessagingRepository } from './repositories/messaging/IMessagingRepository';
import { MessagingRepositoryMock } from './repositories/messaging/MessagingRepositoryMock';
import { IOmnistrateRepository } from './repositories/omnistrate/IOmnistrateRepository';
import { OmnistrateRepository } from './repositories/omnistrate/OmnistrateRepository';

export const setupGlobalContainer = (fastify: FastifyInstance) => {
  diContainer.register({
    [ICaptchaRepository.repositoryName]: asFunction(() => {
      if (process.env.NODE_ENV !== 'production' && process.env.MOCK_CAPTCHA_REPOSITORY === 'true') {
        return new CaptchaRepositoryMock();
      }

      return new ReCaptchaRepository({
        logger: fastify.log,
        secretKey: fastify.config.RECAPTCHA_SECRET_KEY,
      });
    }),

    [IOmnistrateRepository.repositoryName]: asFunction(() => {
      return new OmnistrateRepository(fastify.config.OMNISTRATE_EMAIL, fastify.config.OMNISTRATE_PASSWORD);
    }),
  });
};

export const setupContainer = (req: FastifyRequest) => {
  diContainer.register({
    [IAuthRepository.repositoryName]: asFunction(() => {
      if (process.env.NODE_ENV !== 'production' && process.env.MOCK_AUTH_REPOSITORY === 'true') {
        return new AuthRepositoryMock();
      }
      return new AuthRepositoryIdentityPlatform({
        logger: req.log,
      });
    }),

    [IUsersRepository.repositoryName]: asFunction(() => {
      if (process.env.NODE_ENV !== 'production' && process.env.MOCK_USERS_REPOSITORY === 'true') {
        // TODO: Create a mock for the UsersRepository
        return;
      }
      return new UsersRepositoryFalkorDBClient({
        logger: req.log,
        client: req.server.falkordbClient,
      });
    }),

    [IMessagingRepository.repositoryName]: asFunction(() => {
      if (process.env.NODE_ENV !== 'production' && process.env.MOCK_MESSAGING_REPOSITORY === 'true') {
        return new MessagingRepositoryMock();
      }
      // TODO: Create a real implementation for the MessagingRepository
    }),
  });
};
