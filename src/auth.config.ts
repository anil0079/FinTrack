import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;

            // For now, allow everything. In a real app, protect routes here.
            // const isOnDashboard = nextUrl.pathname.startsWith('/income');
            // if (isOnDashboard) {
            //   if (isLoggedIn) return true;
            //   return false; // Redirect unauthenticated users to login page
            // }
            // if (isLoggedIn) {
            //   return Response.redirect(new URL('/income', nextUrl));
            // }
            return true;
        },
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token?.sub) {
                session.user.id = token.sub;
                // @ts-ignore
                session.accessToken = token.accessToken;
            }
            return session;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
