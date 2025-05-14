import {
  DeleteUserRequestParamsSchemaType,
  LoginWithEmailRequestBodySchemaType,
  LoginWithEmailResponseSuccessSchemaType,
  SendForgotPasswordRequestBodySchemaType,
  SignUpWithEmailRequestBodySchemaType,
  SignUpWithEmailResponseSuccessSchemaType,
  VerifyTokenRequestQuerySchemaType,
  VerifyTokenResponseSuccessSchemaType,
} from '@falkordb/schemas/services/auth/v1';
import { Client } from '../../client';

export const AuthV1 = (client: Client) => ({
  signupWithEmail: (body: SignUpWithEmailRequestBodySchemaType): Promise<SignUpWithEmailResponseSuccessSchemaType> => {
    return client.post('/signup/email', body);
  },

  loginWithEmail: (body: LoginWithEmailRequestBodySchemaType): Promise<LoginWithEmailResponseSuccessSchemaType> => {
    return client.post('/login/email', body);
  },

  sendForgotPasswordEmail: (body: SendForgotPasswordRequestBodySchemaType): Promise<void> => {
    return client.post('/forgot-password', body);
  },

  verifyToken: (query: VerifyTokenRequestQuerySchemaType): Promise<VerifyTokenResponseSuccessSchemaType> => {
    return client.get('/verify-token', { query });
  },

  deleteUser: (params: DeleteUserRequestParamsSchemaType): Promise<void> => {
    return client.delete(`/${params.userId}`);
  },
});
