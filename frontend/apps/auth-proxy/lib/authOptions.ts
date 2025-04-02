import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { axiosClient } from "../axios";
import { verifyRecaptchaToken } from '../lib/utils/verifyRecaptchaToken';
import { sign, decode, verify } from "jsonwebtoken";
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        try {

          await verifyRecaptchaToken(req.body?.reCaptchaToken ?? '');

          const res = await axiosClient.post(
            "https://api.omnistrate.cloud/2022-09-01-00/customer-user-signin",
            {
              email: credentials?.email,
              password: credentials?.password,
            }
          );

          if (res?.data?.jwtToken) {
            const payload = decode(res.data.jwtToken) as any;
            return {
              id: payload.userID,
              email: credentials?.email,
            };
          }
          return null;
        } catch (e) {
          console.error((e as any).toJSON());
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin",
    signOut: "/signout",
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    encode: async ({ secret, token }) => {
      if (!token) {
        throw new Error("No token provided");
      }
      const jwtToken = sign(token, secret);
      return jwtToken;
    },
    decode: async ({ secret, token }) => {
      if (!token) {
        return null;
      }
      const decoded = verify(token, secret) as any;
      return decoded;
    },
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      },
      name: "token",
    },
  },
};