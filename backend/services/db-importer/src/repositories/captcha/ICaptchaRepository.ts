export abstract class ICaptchaRepository {
  static repositoryName = 'ICaptchaRepository';

  abstract verify(token: string): Promise<boolean>;
}
