// import NextAuth, { NextAuthOptions } from "next-auth";
// import type { Session } from "next-auth";
// import type { JWT } from "next-auth/jwt";
// import FacebookProvider from "next-auth/providers/facebook";
// import GoogleProvider from "next-auth/providers/google";

// function extractProviderId(profile: unknown): string | undefined {
//   if (profile && typeof profile === "object") {
//     const candidate = profile as { sub?: unknown; id?: unknown };
//     if (typeof candidate.sub === "string") {
//       return candidate.sub;
//     }
//     if (typeof candidate.id === "string") {
//       return candidate.id;
//     }
//   }
//   return undefined;
// }

// const nextAuthSecret =
//   process.env.NEXTAUTH_SECRET ??
//   process.env.AUTH_SECRET ??
//   "miclubpadel-dev-secret";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     FacebookProvider({
//       clientId: process.env.FACEBOOK_CLIENT_ID!,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
//       authorization: {
//         params: {
//           scope: "email,public_profile",
//         },
//       },
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       profile(profile) {
//         return {
//           id: profile.sub,
//           name: profile.name,
//           email: profile.email,
//           image: profile.picture,
//         };
//       },
//     }),
//   ],

//   session: {
//     strategy: "jwt",
//   },

//   callbacks: {
//     async signIn({ user }) {
//       console.log("Nuevo login:", user?.email ?? "sin email");
//       return true;
//     },

//     async jwt({ token, account, profile }) {
//       const extendedToken = token as JWT & {
//         accessToken?: string;
//         idToken?: string;
//         profile?: Record<string, unknown>;
//         userId?: string;
//       };

//       if (account?.access_token) {
//         extendedToken.accessToken = account.access_token;
//       }
//       if (account?.id_token) {
//         extendedToken.idToken = account.id_token;
//       }
//       if (profile) {
//         extendedToken.profile = profile as Record<string, unknown>;
//         const providerId = extractProviderId(profile);
//         if (providerId) {
//           extendedToken.userId = providerId;
//         }
//       }
//       if (!extendedToken.userId && typeof extendedToken.sub === "string") {
//         extendedToken.userId = extendedToken.sub;
//       }

//       return extendedToken;
//     },

//     async session({ session, token }) {
//       const extendedSession = session as Session & {
//         accessToken?: string;
//         idToken?: string;
//         profile?: Record<string, unknown>;
//       };
//       const extendedToken = token as JWT & {
//         accessToken?: string;
//         idToken?: string;
//         profile?: Record<string, unknown>;
//         userId?: string;
//       };

//       if (typeof extendedToken.accessToken === "string") {
//         extendedSession.accessToken = extendedToken.accessToken;
//       }
//       if (typeof extendedToken.idToken === "string") {
//         extendedSession.idToken = extendedToken.idToken;
//       }
//       if (extendedToken.profile) {
//         extendedSession.profile = extendedToken.profile;
//       }
//       if (extendedSession.user && typeof extendedToken.userId === "string") {
//         extendedSession.user.id = extendedToken.userId;
//       }

//       return extendedSession;
//     },
//   },

//   secret: nextAuthSecret,
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };


import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };