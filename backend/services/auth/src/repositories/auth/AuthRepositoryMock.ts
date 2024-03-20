import { AuthTokenSchemaType } from '@falkordb/schemas/dist/global';
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

  verifyToken(token: string): Promise<AuthTokenSchemaType> {
    return Promise.resolve({
      uid: 'uid',
      email: 'email',
      iat: 100,
      exp: 100,
      alg: 'alg',
      aud: 'aud',
      auth_time: 100,
      email_verified: true,
      iss: 'iss',
      kid: 'kid',
      sub: 'sub',
      typ: 'typ',
      user_id: 'user_id',
    });
  }
}
