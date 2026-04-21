import NextAuth from "next-auth"
 import GoogleProvider from "next-auth/providers/google"
import prisma from "./prisma"
import {PrismaAdapter} from "@auth/prisma-adapter"
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  })],
})
