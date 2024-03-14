import { diContainer } from '@fastify/awilix';
import { asClass, asFunction, Lifetime } from 'awilix';
import { FastifyRequest } from 'fastify';
import { IUsersRepository } from './repositories/users/IUsersRepository';
import { UsersRepositoryMongoDB } from './repositories/users/UsersRepositoryMongoDB';
import { IMembershipsRepository } from './repositories/membership/IMembershipsRepository';
import { MembershipsRepositoryMock } from './repositories/membership/MembershipsRepositoryMock';
import { IInvitationsRepository } from './repositories/invitations/IInvitationsRepository';
import { InvitationsRepositoryMock } from './repositories/invitations/InvitationsRepositoryMock';
import { UsersRepositoryMock } from './repositories/users/UsersRepositoryMock';
import { InvitationsRepositoryFalkorDBClient } from './repositories/invitations/InvitationsRepositoryFalkorDBClient';
import { MembershipsRepositoryFalkorDBClient } from './repositories/membership/MembershipsRepositoryFalkorDBClient';

export const setupContainer = (req: FastifyRequest) => {
  if (process.env.NODE_ENV === 'test' && process.env.MOCK_CONTAINER === 'true') {
    return setupTestContainer();
  }

  diContainer.register({
    [IUsersRepository.repositoryName]: asFunction(() => {
      return new UsersRepositoryMongoDB(
        {
          logger: req.log,
        },
        req.server.mongo.client,
      );
    }),

    [IMembershipsRepository.repositoryName]: asFunction(() => {
      return new MembershipsRepositoryFalkorDBClient(req.server.falkordbClient);
    }),

    [IInvitationsRepository.repositoryName]: asFunction(() => {
      return new InvitationsRepositoryFalkorDBClient(req.server.falkordbClient);
    }),
  });
};

// TODO: Create mock repositories
const setupTestContainer = () => {
  diContainer.register({
    [IUsersRepository.repositoryName]: asFunction(() => {
      return new UsersRepositoryMock();
    }),

    [IMembershipsRepository.repositoryName]: asFunction(() => {
      return new MembershipsRepositoryMock();
    }),

    [IInvitationsRepository.repositoryName]: asFunction(() => {
      return new InvitationsRepositoryMock();
    }),
  });
};
