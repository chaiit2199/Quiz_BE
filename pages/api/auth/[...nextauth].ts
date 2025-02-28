import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("Email và mật khẩu là bắt buộc.");
        }

        // Find the user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            active_user: true,
          },
        });

        if (!user) {
          throw new Error("Tài khoản không tồn tại.");
        }

        // Check if password is valid
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Mật khẩu không đúng.");
        }

        // Check if the account is active
        if (!user.active_user) {
          throw new Error("Tài khoản của bạn không hoạt động.");
        }

        // Return the complete user object, including active_user
        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          active_user: user.active_user,
        };
      }
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string | null | undefined;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
});
