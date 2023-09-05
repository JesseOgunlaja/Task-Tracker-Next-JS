import { User, getByEmail, getByName, redis } from "@/utils/redis";
import { emailSchema, passwordSchema, usernameSchema } from "@/utils/zod";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

export async function POST(req: NextRequest) {
  const body = await req.json();

  const CODE = await redis.get(body.email);

  if (CODE === body.code) {
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

    if (
      (await getByEmail(body.email)) != undefined ||
      (await getByName(body.name)) != undefined
    ) {
      return NextResponse.json({ message: "Duplicate" }, { status: 400 });
    }

    const uuid1 = uuidv4();
    const user: User = {
      uuid: uuid1,
      name: body.name.toUpperCase(),
      email: body.email.toLowerCase(),
      password: await bcrypt.hash(body.password, 10),
      tasks: [],
      projects: [],
      settings: {
        twoFactorAuth: false,
        timeFormat: 12,
        dateFormat: "dd/MM/yyyy",
        calendars: ["Home", "Work", "Personal"],
      },
    };
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

      cookies().set({
        name: "credentials",
        value: "",
        expires: expirationDate,
      });
      const uuid2 = uuidv4();
      await redis.hset(uuid2, user);
      await fetch(`${process.env.REDIS_URL}/del/${body.email}`, {
        headers: {
          Authorization: `Bearer ${process.env.REDIS_TOKEN}`,
        },
      });
      return NextResponse.json({ user, message: "Success" }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error }, { status: 400 });
    }
  } else {
    return NextResponse.json({ message: "Incorrect code" }, { status: 400 });
  }
}
