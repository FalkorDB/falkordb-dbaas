import {
  CreateOperationParamsSchemaType,
  OperationProviderSchemaType,
  OperationSchemaType,
  OperationStatusSchemaType,
} from '../../schemas/operation';

export abstract class IOperationsRepository {
  static repositoryName = 'OperationsRepository';

  abstract create(params: CreateOperationParamsSchemaType): Promise<OperationSchemaType>;

  abstract get(id: string): Promise<OperationSchemaType | null>;

  abstract updateStatus(
    id: string,
    status: OperationStatusSchemaType,
    payload?: {
      buildId?: string;
    },
  ): Promise<OperationSchemaType>;

  abstract lastPublishTimeTransaction(id: string, lastPublishTime: string): Promise<OperationSchemaType>;
}
