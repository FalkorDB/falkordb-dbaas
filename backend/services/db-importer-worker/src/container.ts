import { asClass, asFunction, Lifetime, createContainer } from 'awilix';
import { ITasksDBRepository, TasksDBMongoRepository } from './repositories/tasks';
import logger from './logger';
import { K8sRepository } from './repositories/k8s/K8sRepository';
import { IBlobStorageRepository } from './repositories/blob/IBlobStorageRepository';
import { BlobStorageGCSRepository } from './repositories/blob/BlobStorageGCSRepository';

export const setupContainer = () => {
  // Register global dependencies here
  const container = createContainer({
    injectionMode: 'PROXY',
    strict: true,
  })

  container.register({
    logger: asFunction(() => logger).singleton(),
    // Register your global dependencies here
    // Example: myService: asClass(MyService).singleton(),
    [ITasksDBRepository.name]: asFunction<ITasksDBRepository>(() => new TasksDBMongoRepository({
      logger,
    })).singleton(),

    [K8sRepository.name]: asFunction<K8sRepository>(() => new K8sRepository({
      logger,
    })).singleton(),

    [IBlobStorageRepository.name]: asFunction<IBlobStorageRepository>(() => new BlobStorageGCSRepository({
      logger,
    })).singleton(),
  });

  return container;
};
