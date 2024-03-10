import { FastifyBaseLogger } from 'fastify';
import { IOrganizationsRepository } from '../../../repositories/organizations/IOrganizationsRepository';
import { CreateOrganizationRequestBodyType } from '../schemas/organizations';
import { OrganizationType } from '../../../schemas/organization';
import { ApiError } from '@falkordb/errors';
import { RoleType } from '../../../schemas/roles';
import { IMembersRepository } from '../../../repositories/members/IMembersRepository';

export class CreateOrganizationService {
  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private organizationsRepository: IOrganizationsRepository,
    private membersRepository: IMembersRepository,
  ) {}

  async create(params: CreateOrganizationRequestBodyType & { creatorUserId: string }): Promise<OrganizationType> {
    const organization = await this._createOrganization(params);
    await this._addMember(organization.id, params.creatorUserId, 'owner');
    return organization;
  }

  async _createOrganization(
    params: CreateOrganizationRequestBodyType & { creatorUserId: string },
  ): Promise<OrganizationType> {
    try {
      return await this.organizationsRepository.create(params);
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to create organization', 'FAILED_TO_CREATE_ORGANIZATION');
    }
  }

  async _addMember(organizationId: string, userId: string, role: RoleType): Promise<void> {
    try {
      await this.membersRepository.create({
        organizationId,
        userId,
        role,
      });
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError(
        'Failed to add member to organization',
        'FAILED_TO_ADD_MEMBER_TO_ORGANIZATION',
      );
    }
  }
}
