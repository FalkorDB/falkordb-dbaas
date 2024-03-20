import { IAuthRepository } from './IAuthRepository';

export interface SignUpResponse {
  email: string;
  token: string;
  expiresIn: number;
  refreshToken: string;
  uid: string;
}

export class AuthRepositoryMock implements IAuthRepository {
  signup(email: string, password: string): Promise<SignUpResponse> {
    return Promise.resolve({
      email: email,
      token: 'token',
      expiresIn: 100,
      refreshToken: 'refreshToken',
      uid: 'uid',
    });
  }

  loginWithEmail(email: string, password: string): Promise<SignUpResponse> {
    return Promise.resolve({
      email: email,
      token: 'token',
      expiresIn: 100,
      refreshToken: 'refreshToken',
      uid: 'uid',
    });
  }

  delete(uid: string): Promise<void> {
    return Promise.resolve();
  }

  createForgotPasswordLink(params: { email: string; continueUrl: string }): Promise<{ code: string; link: string }> {
    return Promise.resolve({
      code: 'code',
      link: 'link',
    });
  }
}
