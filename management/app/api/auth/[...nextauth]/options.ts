import type { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import { TypeORMAdapter, getManager } from '@auth/typeorm-adapter'
import { Adapter } from "next-auth/adapters"
import { DataSourceOptions } from "typeorm"

const env = process.env.NODE_ENV;
const dataSourceOptions: DataSourceOptions = {
    type: "postgres",
    host: (process.env.POSTGRES_HOST || "localhost") as string,
    port: Number(process.env.POSTGRES_PORT || 5432),
    username: process.env.POSTGRES_USER as string,
    password: process.env.POSTGRES_PASSWORD as string,
    database: (process.env.POSTGRES_DATABASE || "falkordb") as string,
    synchronize: (env == "development" ? true : false),
    ssl: (env == "development" ? undefined : {
        rejectUnauthorized: false,
        requestCert: true,
    }),
}

const authOptions : AuthOptions = {
    adapter: TypeORMAdapter(dataSourceOptions) as Adapter,
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    pages: {
        signIn: "/signin",
    },
}

export default authOptions