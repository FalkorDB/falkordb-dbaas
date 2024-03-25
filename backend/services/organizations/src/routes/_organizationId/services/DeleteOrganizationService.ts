import { FastifyBaseLogger } from 'fastify';
import { IOrganizationsRepository } from '../../../repositories/organizations/IOrganizationsRepository';
import { IMembersRepository } from '../../../repositories/members/IMembersRepository';

export class DeleteOrganizationService {
  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private organizationsRepository: IOrganizationsRepository,
    private membersRepository: IMembersRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.organizationsRepository.delete(id);
    await this.membersRepository.deleteQuery({
      organizationId: id,
    });
  }
}
