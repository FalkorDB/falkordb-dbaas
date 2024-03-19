import { UserSchemaType } from '@falkordb/schemas/dist/global';

export abstract class IUsersRepository {
  static repositoryName = 'UsersRepository';

  abstract get(id: string): Promise<UserSchemaType>;
}
