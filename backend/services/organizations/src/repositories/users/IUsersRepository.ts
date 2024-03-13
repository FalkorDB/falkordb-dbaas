import { UserSchemaType } from '@falkordb/schemas/src/global';

export abstract class IUsersRepository {
  static repositoryName = 'UsersRepository';

  abstract get(id: string): Promise<UserSchemaType>;
}
