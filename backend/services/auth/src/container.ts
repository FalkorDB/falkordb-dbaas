import { diContainer } from '@fastify/awilix';
import { asClass, asFunction, Lifetime } from 'awilix';
import { FastifyRequest } from 'fastify';

export const setupContainer = (req: FastifyRequest) => {
  if (process.env.NODE_ENV === 'test' && process.env.MOCK_CONTAINER === 'true') {
    return setupTestContainer();
  }

  diContainer.register({});
};

// TODO: Create mock repositories
const setupTestContainer = () => {
  diContainer.register({});
};
