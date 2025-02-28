import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import crypto from "crypto";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: "Email không tồn tại." });
  }

  // create token reset password
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 3600000); 

  // Save token DB
  await prisma.user.update({
    where: { email },
    data: { resetToken, resetTokenExpiry },
  });

  // Send email link reset password
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    to: email,
    subject: "Password Reset",
    html: `<p>Nhấn vào link sau để đặt lại mật khẩu:</p>
           <a href="${resetUrl}">${resetUrl}</a>`,
  });

  res.status(200).json({ message: "Link đặt lại mật khẩu đã được gửi tới email." });
}
