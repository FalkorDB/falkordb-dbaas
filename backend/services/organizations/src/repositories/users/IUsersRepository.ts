import { UserSchemaType } from '@falkordb/schemas/global';

export abstract class IUsersRepository {
  static repositoryName = 'UsersRepository';

  abstract get(id: string): Promise<UserSchemaType>;
}
