import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { axiosClient } from "../axios";
import { jwtDecode } from "jwt-decode";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const res = await axiosClient.post(
            "https://api.omnistrate.cloud/2022-09-01-00/customer-user-signin",
            {
              email: credentials?.email,
              password: credentials?.password,
            }
          );

          if (res?.data?.jwtToken) {
            const payload = jwtDecode(res.data.jwtToken) as any;
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
  jwt: {
    secret: process.env.NEXTAUTH_JWT_SECRET,
  },
};