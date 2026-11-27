import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { allowedDomains, isAllowedProfile } from "@/lib/auth/allowed";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/signin", error: "/signin" },
  callbacks: {
    signIn: ({ profile }) => isAllowedProfile(profile ?? {}, allowedDomains()),
  },
});
