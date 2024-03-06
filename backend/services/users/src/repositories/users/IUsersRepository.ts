import { UserCreateSchemaType, UserSchemaType, UserUpdateSchemaType } from '../../schemas/user';

export abstract class IUsersRepository {
  static repositoryName = 'UsersRepository';

  create(params: UserCreateSchemaType): Promise<UserSchemaType> {
    throw new Error('Method not implemented.');
  }

  get(id: string): Promise<UserSchemaType> {
    throw new Error('Method not implemented.');
  }

  update(id: string, params: UserUpdateSchemaType): Promise<UserSchemaType> {
    throw new Error('Method not implemented.');
  }

  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
