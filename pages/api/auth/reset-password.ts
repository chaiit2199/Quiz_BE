import { NextApiRequest, NextApiResponse } from 'next';

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { token, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gte: new Date() }, // check token Expiry
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }

  // bcrypt.hash new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // update password end delete token
  await prisma.user.update({
    where: { email: user.email },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
      updated_date: new Date()
    },
  });

  res.status(200).json({ message: "Mật khẩu đã được đặt lại thành công!" });
}
