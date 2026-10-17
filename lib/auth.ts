import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { scryptSync, timingSafeEqual } from "node:crypto";
const attempts = new Map<string, { count: number; until: number }>();
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = String(credentials.email ?? "").toLowerCase();
        const password = String(credentials.password ?? "");
        const entry = attempts.get("owner");
        if (entry && entry.until > Date.now() && entry.count >= 8) return null;
        if (entry && entry.until <= Date.now()) attempts.delete("owner");
        const [salt, hash] = (process.env.OWNER_PASSWORD_HASH ?? "").split(":");
        let valid = false;
        if (salt && hash && password.length <= 256) {
          const actual = scryptSync(password, salt, 64);
          const expected = Buffer.from(hash, "hex");
          valid =
            expected.length === actual.length &&
            timingSafeEqual(actual, expected);
        }
        if (
          !valid ||
          !process.env.OWNER_EMAIL ||
          email !== process.env.OWNER_EMAIL.toLowerCase()
        ) {
          const existing = attempts.get("owner");
          attempts.set("owner", {
            count: (existing?.count ?? 0) + 1,
            until: existing?.until ?? Date.now() + 15 * 60 * 1000,
          });
          return null;
        }
        attempts.delete("owner");
        return { id: "owner", email, name: "Portfolio owner" };
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token.email) session.user.email = token.email;
      return session;
    },
  },
});
export async function isOwner() {
  const session = await auth();
  return Boolean(
    session?.user?.email &&
    process.env.OWNER_EMAIL &&
    session.user.email.toLowerCase() === process.env.OWNER_EMAIL.toLowerCase(),
  );
}
