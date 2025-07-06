import NextAuth from "next-auth";
import AppleProvider from "next-auth/providers/apple";
import GoogleProvider from "next-auth/providers/google";
import CredentialProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { cloudinary } from "@/lib/cloudinary";

import bcrypt from "bcrypt";

console.log("GOOGLE_CLIENT_ID in runtime:", process.env.Google_Client_ID);

export const authOptions = {
 debug:true,
 adapter: PrismaAdapter(prisma),
    providers:[
        // AppleProvider({
        //     clientId: process.env.App,
        //     clientSecret: process.env.Google_Client_Secret
        // }),
        GoogleProvider({
            clientId: process.env.Google_Client_ID,
            clientSecret: process.env.Google_Client_Secret,
            httpOptions: {
                timeout: 10000, // 10 seconds timeout instead of 3.5
            },
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
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        newUser: "/",
    },
    callbacks: {
        async  jwt({ token, user, account, profile }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.image = user.image; // <-- crucial: image from DB (or default)
            }

            // On Google login: upload profile picture to Cloudinary
            if (account?.provider === "google" && profile?.picture) {
                try {
                const publicId = `user_profiles/user_${user.id}`;

                const uploadRes = await cloudinary.uploader.upload(profile.picture, {
                    folder: "user_profiles",
                    public_id: publicId,
                    overwrite: true,
                });

                // Set Cloudinary image in JWT token
                token.image = uploadRes.secure_url;
                } catch (err) {
                console.error("Cloudinary upload failed:", err);
                }
            }

            return token;
            },
         async session({ session, token }) {
            try {
                const user = await prisma.user.findUnique({
                where: { email: token.email },
                });

                if (user) {
                session.user.id = user.id;
                session.user.name = user.name;
                session.user.email = user.email;
                session.user.image = user.image; // ✅ this often fails if null
                }

                return session;
            } catch (error) {
                console.error("Session callback error:", error);
                return null; // fallback to avoid crash
            }
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

};


const handler = NextAuth(authOptions); 
export { handler as GET, handler as POST };
