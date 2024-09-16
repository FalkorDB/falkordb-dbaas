import { diContainer } from '@fastify/awilix';
import { asClass, asFunction, Lifetime } from 'awilix';
import { FastifyInstance, FastifyRequest } from 'fastify';

export const setupGlobalContainer = (fastify: FastifyInstance) => {
  diContainer.register({});
};

export const setupContainer = (req: FastifyRequest) => {
  diContainer.register({});
};
