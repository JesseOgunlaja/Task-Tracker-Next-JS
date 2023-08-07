import { connectToDB } from "@/utils/mongoDB";
import { emailSchema, passwordSchema, usernameSchema } from "@/utils/zod";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

export async function POST(req: NextRequest) {
  const User = await connectToDB();

  const body = await req.json();

  if (body.name) {
    const result = usernameSchema.safeParse(body.name);
    if (result.success === false) {
      const error = result.error.format()._errors[0];
      return NextResponse.json({ error: error }, { status: 400 });
    }
  }
  if (body.email) {
    const result = emailSchema.safeParse(body.email);
    if (result.success === false) {
      const error = result.error.format()._errors[0];
      return NextResponse.json({ error: error }, { status: 400 });
    }
  }
  if (body.password) {
    const result = passwordSchema.safeParse(body.password);
    if (result.success === false) {
      const error = result.error.format()._errors[0];
      return NextResponse.json({ error: error }, { status: 400 });
    }
  }

  const user = new User({
    name: body.name.toUpperCase(),
    email: body.email.toLowerCase(),
    password: await bcrypt.hash(body.password, 10),
    tasks: [],
    twoFactorAuth: false
  });
  try {
    const expirationDate = new Date(new Date().getTime() - 1000);

    cookies().set({
      name: "token",
      value: "",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: expirationDate,
    });
    const newUser = await user.save();
    const uuid = uuidv4();
    await fetch(
      `https://desired-orca-41910.upstash.io/set/${newUser._id}/${uuid}`,
      {
        headers: {
          Authorization:
            `Bearer ${process.env.REDIS_TOKEN}`,
        },
      },
    );
    return NextResponse.json({ newUser, message: "Success" }, { status: 201 });
  } catch (error: any) {
    if (error.message.includes("duplicate")) {
      if (error.message.includes("email")) {
        return NextResponse.json(
          { message: `Duplicate email` },
          { status: 400 },
        );
      } else if (error.message.includes("name")) {
        return NextResponse.json(
          { message: `Duplicate name` },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json({ error: error }, { status: 400 });
    }
  }
}
