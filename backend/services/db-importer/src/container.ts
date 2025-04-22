import { diContainer } from '@fastify/awilix';
import { asClass, asFunction, Lifetime } from 'awilix';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { ICaptchaRepository } from './repositories/captcha/ICaptchaRepository';
import { ReCaptchaRepository } from './repositories/captcha/ReCaptchaRepository';
import { ITasksDBRepository, TasksDBMongoRepository } from './repositories/tasks';
import { OmnistrateRepository } from './repositories/omnistrate/OmnistrateRepository';
import { K8sRepository } from './repositories/k8s/K8sRepository';
import { CaptchaRepositoryMock } from './repositories/captcha/CaptchaRepositoryMock';
import { ITaskQueueRepository } from './repositories/tasksQueue/ITaskQueueRepository';
import { TaskQueueBullMQRepository } from './repositories/tasksQueue/TaskQueueBullMQRepository';

export const setupGlobalContainer = (fastify: FastifyInstance) => {
  diContainer.register({

    [ICaptchaRepository.repositoryName]: asFunction(() => {
      if (process.env.NODE_ENV !== 'production' && process.env.MOCK_CAPTCHA_REPOSITORY === 'true') {
        return new CaptchaRepositoryMock();
      }

      return new ReCaptchaRepository(
        process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
        {
          logger: fastify.log,
        },
      );
    }).singleton(),

    [ITasksDBRepository.name]: asFunction(() => {
      return new TasksDBMongoRepository(
        {
          logger: fastify.log,
        },
      );
    }).singleton(),

    [OmnistrateRepository.name]: asFunction(() => {
      return new OmnistrateRepository(
        process.env.OMNISTRATE_USER,
        process.env.OMNISTRATE_PASSWORD,
        process.env.OMNISTRATE_SERVICE_ID,
        process.env.OMNISTRATE_ENVIRONMENT_ID,
        {
          logger: fastify.log,
        },
      );
    }).singleton(),

    [K8sRepository.name]: asFunction(() => {
      return new K8sRepository(
        {
          logger: fastify.log,
        },
      );
    }).singleton(),

    [ITaskQueueRepository.name]: asFunction(() => {
      return new TaskQueueBullMQRepository(
        {
          logger: fastify.log,
        },
      );
    }).singleton(),
  });
};

export const setupContainer = (req: FastifyRequest) => {
  diContainer.register({});
};
