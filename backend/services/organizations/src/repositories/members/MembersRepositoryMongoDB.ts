import { FastifyBaseLogger } from 'fastify';
import { MongoClient, ObjectId } from 'mongodb';
import { ApiError } from '@falkordb/errors';
import { IMembersRepository } from './IMembersRepository';
import { CreateMemberType, MemberType, UpdateMemberType, RoleType } from '@falkordb/schemas/src/global';

export class MembersRepositoryMongoDB implements IMembersRepository {
  collection = this._client.db().collection('members');

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private _client: MongoClient,
  ) {}

  async create(params: CreateMemberType): Promise<MemberType> {
    try {
      const insert = {
        ...params,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await this.collection.insertOne(insert);

      return {
        id: response.insertedId.toHexString(),
        ...insert,
      };
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to create member', 'FAILED_TO_CREATE_MEMBER');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.collection.findOneAndDelete({ _id: new ObjectId(id) }, {});
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to delete member', 'FAILED_TO_DELETE_MEMBER');
    }
  }

  async get(id: string): Promise<MemberType> {
    try {
      const response = await this.collection.findOne({ _id: new ObjectId(id) });

      if (!response) {
        throw ApiError.notFound('Member not found', 'MEMBER_NOT_FOUND');
      }

      return {
        id: response._id.toHexString(),
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        organizationId: response.organizationId,
        userId: response.userId,
        role: response.role,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to get member', 'FAILED_TO_GET_MEMBER');
    }
  }

  async update(id: string, params: UpdateMemberType): Promise<MemberType> {
    try {
      const response = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...params,
            updatedAt: new Date().toISOString(),
          },
        },
        { returnDocument: 'after' },
      );

      if (!response) {
        throw ApiError.notFound('Member not found', 'MEMBER_NOT_FOUND');
      }

      return {
        id: response._id.toHexString(),
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        organizationId: response.organizationId,
        userId: response.userId,
        role: response.role,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to update member', 'FAILED_TO_UPDATE_MEMBER');
    }
  }

  async query(params: {
    organizationId?: string;
    role?: RoleType;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: MemberType[]; count: number }> {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const query: { [key: string]: unknown } = {};

      if (params.organizationId) {
        query.organizationId = params.organizationId;
      }

      if (params.role) {
        query.role = params.role;
      }

      const [response, count] = await Promise.all([
        this.collection
          .find(query)
          .skip((page > 0 ? page - 1 : 0) * pageSize)
          .limit(pageSize)
          .toArray(),
        this.collection.countDocuments(query),
      ]);

      return {
        count,
        data: response.map((item) => {
          return {
            id: item._id.toHexString(),
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            organizationId: item.organizationId,
            userId: item.userId,
            role: item.role,
          };
        }),
      };
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to query members', 'FAILED_TO_QUERY_MEMBERS');
    }
  }

  async deleteQuery(params: { organizationId?: string }): Promise<void> {
    try {
      await this.collection.deleteMany({ organizationId: params.organizationId });
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to delete members', 'FAILED_TO_DELETE_MEMBERS');
    }
  }
}
