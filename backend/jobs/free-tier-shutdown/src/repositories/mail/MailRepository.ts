import { Logger } from 'pino';

export class MailRepository {
  constructor(private _options: { logger: Logger }) {}
  async sendInstanceStoppedEmail(email: string, instanceId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
