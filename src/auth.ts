import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            authorization: {
                params: {
                    scope: 'openid email profile https://www.googleapis.com/auth/calendar.events'
                }
            }
        })
    ],
    session: { strategy: 'jwt' }
});
