import { diContainer } from '@fastify/awilix';
import { asClass, asFunction, Lifetime } from 'awilix';
import { CloudProvisionConfigsMongoDB } from './repositories/cloud-provision-configs/CloudProvisionConfigsMongoDB';
import { OperationsMongoDB } from './repositories/operations/OperationsMongoDB';
import { TenantGroupsMongoDB } from './repositories/tenant-groups/TenantGroupsMongoDB';
import { FastifyRequest } from 'fastify';
import { ITenantGroupRepository } from './repositories/tenant-groups/ITenantGroupsRepository';
import { IOperationsRepository } from './repositories/operations/IOperationsRepository';
import { ICloudProvisionConfigsRepository } from './repositories/cloud-provision-configs/ICloudProvisionConfigsRepository';

export const setupContainer = (req: FastifyRequest) => {
  if (process.env.NODE_ENV === 'test' && process.env.MOCK_CONTAINER === 'true') {
    return setupTestContainer();
  }

  diContainer.register({
    [ICloudProvisionConfigsRepository.repositoryName]: asFunction(() => {
      return new CloudProvisionConfigsMongoDB(
        {
          logger: req.log,
        },
        req.server.mongo.client,
      );
    }),

    [IOperationsRepository.repositoryName]: asFunction(() => {
      return new OperationsMongoDB(
        {
          logger: req.log,
        },
        req.server.mongo.client,
      );
    }),

    [ITenantGroupRepository.repositoryName]: asFunction(() => {
      return new TenantGroupsMongoDB(
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
    [ICloudProvisionConfigsRepository.repositoryName]: asFunction(() => ({}), {
      lifetime: Lifetime.SCOPED,
    }),

    [IOperationsRepository.repositoryName]: asFunction(() => ({}), {
      lifetime: Lifetime.SCOPED,
    }),

    [ITenantGroupRepository.repositoryName]: asFunction(() => ({}), {
      lifetime: Lifetime.SCOPED,
    }),
  });
};
