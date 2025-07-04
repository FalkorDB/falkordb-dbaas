import { AuthTokenSchemaType } from '@falkordb/schemas/global';

export interface SignUpResponse {
  email: string;
  token: string;
  expiresIn: number;
  refreshToken: string;
  uid: string;
}

export abstract class IAuthRepository {
  static repositoryName: string = 'IAuthRepository';

  abstract signup(
    email: string,
    password: string,
    params?: {
      firstName?: string;
      lastName?: string;
    },
  ): Promise<SignUpResponse>;

  abstract loginWithEmail(email: string, password: string): Promise<SignUpResponse>;

  abstract delete(uid: string): Promise<void>;

  abstract createForgotPasswordLink(params: {
    email: string;
    continueUrl: string;
  }): Promise<{ code: string; link: string }>;

  abstract verifyToken(token: string): Promise<AuthTokenSchemaType>;
}
