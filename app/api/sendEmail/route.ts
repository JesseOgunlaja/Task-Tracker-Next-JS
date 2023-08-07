const nodemailer = require("nodemailer");
import { decryptString } from "@/utils/decryptString";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    secure: true,
    auth: {
      user: "admin@taskmasterapp.com",
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "admin@taskmasterapp.com",
    to: body.email,
    subject: "TaskMaster: Verification Code",
    text: `Verification Code: ${decryptString(body.code, true)}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json(
      { message: `Message sent succesfully` },
      { status: 200 },
    );
  } catch (error) {
    return new Response(`${error}`, { status: 500 });
  }
}
