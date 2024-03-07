import { diContainer } from '@fastify/awilix';
import { asClass, asFunction, Lifetime } from 'awilix';
import { FastifyRequest } from 'fastify';
import { IOrganizationsRepository } from './repositories/organizations/IOrganizationsRepository';
import { OrganizationsRepositoryMongoDB } from './repositories/organizations/OrganizationsRepositoryMongoDB';
import { IMembersRepository } from './repositories/members/IMembersRepository';
import { MembersRepositoryMongoDB } from './repositories/members/MembersRepositoryMongoDB';
import { IInvitationsRepository } from './repositories/invitations/IInvitationsRepository';
import { InvitationsRepositoryMongoDB } from './repositories/invitations/InvitationsRepositoryMongoDB';
import { OrganizationsRepositoryMock } from './repositories/organizations/OrganizationsRepositoryMock';
import { MembersRepositoryMock } from './repositories/members/MembersRepositoryMock';
import { InvitationsRepositoryMock } from './repositories/invitations/InvitationsRepositoryMock';

export const setupContainer = (req: FastifyRequest) => {
  if (process.env.NODE_ENV === 'test' && process.env.MOCK_CONTAINER === 'true') {
    return setupTestContainer();
  }

  diContainer.register({
    [IOrganizationsRepository.repositoryName]: asFunction(() => {
      return new OrganizationsRepositoryMongoDB(
        {
          logger: req.log,
        },
        req.server.mongo.client,
      );
    }),

    [IMembersRepository.repositoryName]: asFunction(() => {
      return new MembersRepositoryMongoDB(
        {
          logger: req.log,
        },
        req.server.mongo.client,
      );
    }),

    [IInvitationsRepository.repositoryName]: asFunction(() => {
      return new InvitationsRepositoryMongoDB(
        {
          logger: req.log,
        },
        req.server.mongo.client,
      );
    }),
  });
};

// TODO: Create mock repositories
const setupTestContainer = () => {
  diContainer.register({
    [IOrganizationsRepository.repositoryName]: asFunction(() => {
      return new OrganizationsRepositoryMock();
    }),

    [IMembersRepository.repositoryName]: asFunction(() => {
      return new MembersRepositoryMock();
    }),

    [IInvitationsRepository.repositoryName]: asFunction(() => {
      return new InvitationsRepositoryMock();
    }),
  });
};
