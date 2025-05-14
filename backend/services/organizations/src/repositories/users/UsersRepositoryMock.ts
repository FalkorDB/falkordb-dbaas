import { UserSchemaType } from '@falkordb/schemas/global';
import { IUsersRepository } from './IUsersRepository';
import { ApiError } from '@falkordb/errors';

export class UsersRepositoryMock implements IUsersRepository {
  private _store: UserSchemaType[] = [];

  get(id: string): Promise<UserSchemaType> {
    const user = this._store.find((o) => o.id === id);
    if (!user) {
      throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
    }

    return Promise.resolve(user);
  }
}
