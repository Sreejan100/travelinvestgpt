import NextAuth from "next-auth";
import AppleProvider from "next-auth/providers/apple";
import GoogleProvider from "next-auth/providers/google";
import CredentialProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import bcrypt from "bcrypt";

console.log("GOOGLE_CLIENT_ID in runtime:", process.env.GOOGLE_CLIENT_ID);

export const handler = NextAuth({
 debug:true,
 adapter: PrismaAdapter(prisma),
    providers:[
        // AppleProvider({
        //     clientId: process.env.App,
        //     clientSecret: process.env.Google_Client_Secret
        // }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.clientSecret,
            authorization: {
                 params: {
                     prompt: "select_account", // 👈 always ask which account to use
                },
        },
        }),
        CredentialProvider({
            name: "Credentials",
            credentials: {
                email :{label: "Email", type: "text"},
                password: {lable: "Password", type: "password"}
            },

            async authorize(credentials) {
                const user  = await prisma.user.findUnique({
                    where : {email: credentials.email}
                });

                if (!user || !user.password) return null;

                const isValid = await bcrypt.compare(credentials.password,user.password);

                if (!isValid) return null;

                return user;
            },
        }),
    ],
    session :{
        strategy: "jwt"
    },
    pages: {
        newUser: "/",
        signIn: "/login"
    },
    callbacks: {
        async session ({session, token}) {
            console.log("Session callback triggered:", { session, token });
            session.user.id = token.sub;
            return session;
        },
        async jwt ({token, user}) {
            console.log("JWT callback triggered:", { token, user });
            if (user) token.id = user.id;
            return token;
        },
    },
    cookies:{
        pkceCodeVerifier: {
            name: "next-auth.pkce.code_verifier",
            options:{
                httpOnly:true,
                sameSite: "none",
                path:'/',
                secure: true
            },
        },
    },

});


export { handler as GET, handler as POST };
