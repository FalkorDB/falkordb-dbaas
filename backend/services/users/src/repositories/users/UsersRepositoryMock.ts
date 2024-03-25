import { ApiError } from '@falkordb/errors';
import { UserSchemaType } from '@falkordb/schemas/dist/global';
import { IUsersRepository } from './IUsersRepository';

export class UsersRepositoryMock implements IUsersRepository {
  _db: UserSchemaType[] = [];

  async create(params: UserSchemaType): Promise<UserSchemaType> {
    this._db.push(params);
    return params;
  }

  async get(id: string): Promise<UserSchemaType> {
    const user = this._db.find((u) => u.id === id);
    if (!user) {
      throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
    }
    return user;
  }

  async query(params: { email?: string; page?: number; pageSize?: number }): Promise<UserSchemaType[]> {
    return this._db.filter((u) => {
      if (params.email && u.email !== params.email) {
        return false;
      }
      return true;
    });
  }

  async update(id: string, params: Partial<UserSchemaType>): Promise<UserSchemaType> {
    const user = this._db.find((u) => u.id === id);
    if (!user) {
      throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
    }
    Object.assign(user, params);
    return user;
  }

  async delete(id: string): Promise<void> {
    const index = this._db.findIndex((u) => u.id === id);
    if (index === -1) {
      throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
    }
    this._db.splice(index, 1);
  }
}
