import { UserSchemaType } from '@falkordb/schemas/global';

export abstract class IUsersRepository {
  static repositoryName = 'IUsersRepository';

  abstract create(params: { id: string; firstName: string; lastName: string; email: string }): Promise<UserSchemaType>;

  abstract delete(id: string): Promise<void>;
}
