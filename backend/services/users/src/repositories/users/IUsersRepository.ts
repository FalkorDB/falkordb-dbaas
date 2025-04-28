import { UserCreateSchemaType, UserSchemaType, UserUpdateSchemaType } from '@falkordb/schemas/global';

export abstract class IUsersRepository {
  static repositoryName = 'UsersRepository';

  abstract create(params: UserCreateSchemaType): Promise<UserSchemaType> ;

  abstract get(id: string): Promise<UserSchemaType> ;

  abstract update(id: string, params: UserUpdateSchemaType): Promise<UserSchemaType> ;

  abstract delete(id: string): Promise<void> ;
}
