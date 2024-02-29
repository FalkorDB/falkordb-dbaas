import { CreateOperationParamsSchemaType, OperationSchemaType } from '../../schemas/operation';

export abstract class IOperationsRepository {
  create(params: CreateOperationParamsSchemaType): Promise<OperationSchemaType> {
    throw new Error('Not implemented');
  }
}
