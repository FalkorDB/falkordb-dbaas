import { ICaptchaRepository } from './ICaptchaRepository';

export class CaptchaRepositoryMock implements ICaptchaRepository {
  static repositoryName = 'ICaptchaRepository';

  verify(token: string): Promise<boolean> {
    return Promise.resolve(true);
  }
}
