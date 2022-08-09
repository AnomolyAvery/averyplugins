import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {

  interface DefaultUser {
    role: string;
  }

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}
