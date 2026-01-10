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
        session({ session, user, token }) {
            if (session.user && token?.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
