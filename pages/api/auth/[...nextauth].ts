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
        // Tìm người dùng theo email
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            active_user: true,
          },
        });

        if (user && credentials?.password) {
          // Kiểm tra mật khẩu hợp lệ
          const isValid = await compare(credentials.password, user.password);
          if (isValid) {
            // Kiểm tra nếu active_user bằng true
            if (user.active_user) {
              return { id: user.id, name: user.name, email: user.email, role: user.role };
            } else {
              throw new Error("Tài khoản của bạn không hoạt động.");
            }
          } else {
            throw new Error("Mật khẩu không đúng.");
          }
        }

        throw new Error("Tài khoản không tồn tại.");
      },
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
