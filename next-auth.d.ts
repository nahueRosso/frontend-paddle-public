import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    idToken?: string;
    profile?: Record<string, unknown>;
    user?: DefaultSession["user"] & {
      id?: string;
    };
  }

  interface User {
    id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    profile?: Record<string, unknown>;
    userId?: string;
  }
}
