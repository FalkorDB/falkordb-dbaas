import {
  CreateOperationParamsSchemaType,
  OperationProviderSchemaType,
  OperationSchemaType,
  OperationStatusSchemaType,
} from '../../schemas/operation';

export abstract class IOperationsRepository {
  static repositoryName = 'OperationsRepository';

  create(params: CreateOperationParamsSchemaType): Promise<OperationSchemaType> {
    throw new Error('Not implemented');
  }

  get(id: string): Promise<OperationSchemaType | null> {
    throw new Error('Not implemented');
  }

  updateStatus(id: string, status: OperationStatusSchemaType, payload?: object): Promise<OperationSchemaType> {
    throw new Error('Not implemented');
  }

  async lastPublishTimeTransaction(id: string, lastPublishTime: string): Promise<OperationSchemaType> {
    throw new Error('Not implemented');
  }
}
