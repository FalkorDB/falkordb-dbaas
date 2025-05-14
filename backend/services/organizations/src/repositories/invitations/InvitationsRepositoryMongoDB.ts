import { FastifyBaseLogger } from 'fastify';
import { MongoClient, ObjectId } from 'mongodb';
import { ApiError } from '@falkordb/errors';
import { IInvitationsRepository } from './IInvitationsRepository';
import { CreateInvitationType, InvitationType, UpdateInvitationType } from '@falkordb/schemas/global';

export class InvitationsRepositoryMongoDB implements IInvitationsRepository {
  collection = this._client.db().collection('invitations');

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private _client: MongoClient,
  ) {}

  async create(params: CreateInvitationType): Promise<InvitationType> {
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
      throw ApiError.internalServerError('Failed to create invitation', 'FAILED_TO_CREATE_INVITATION');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.collection.findOneAndDelete({ _id: new ObjectId(id) }, {});
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to delete invitation', 'FAILED_TO_DELETE_INVITATION');
    }
  }

  async get(id: string): Promise<InvitationType> {
    try {
      const response = await this.collection.findOne({ _id: new ObjectId(id) });

      if (!response) {
        throw ApiError.notFound('Invitation not found', 'INVITATION_NOT_FOUND');
      }

      return {
        id: response._id.toHexString(),
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        email: response.email,
        userId: response.userId,
        organizationId: response.organizationId,
        role: response.role,
        expireAt: response.expireAt,
        status: response.status,
        inviterId: response.inviterId,
        inviterName: response.inviterName,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to get invitation', 'FAILED_TO_GET_INVITATION');
    }
  }

  async update(id: string, params: UpdateInvitationType): Promise<InvitationType> {
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
        throw ApiError.notFound('Invitation not found', 'INVITATION_NOT_FOUND');
      }

      return {
        id: response._id.toHexString(),
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        email: response.email,
        userId: response.userId,
        organizationId: response.organizationId,
        role: response.role,
        expireAt: response.expireAt,
        status: response.status,
        inviterId: response.inviterId,
        inviterName: response.inviterName,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to update invitation', 'FAILED_TO_UPDATE_INVITATION');
    }
  }

  async query(params: {
    email?: string;
    organizationId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: InvitationType[]; count: number }> {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const query: { [key: string]: unknown } = {};

      if (params.organizationId) {
        query.organizationId = params.organizationId;
      }

      if (params.email) {
        query.role = params.email;
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
            email: item.email,
            userId: item.userId,
            organizationId: item.organizationId,
            role: item.role,
            expireAt: item.expireAt,
            status: item.status,
            inviterId: item.inviterId,
            inviterName: item.inviterName,
          };
        }),
      };
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to query invitations', 'FAILED_TO_QUERY_INVITATIONS');
    }
  }
}
