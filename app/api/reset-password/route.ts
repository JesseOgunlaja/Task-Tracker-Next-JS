import { User, getByEmail, redis } from "@/utils/redis";
import { passwordSchema } from "@/utils/zod";
import { NextRequest, NextResponse } from "next/server";
const bcrypt = require("bcrypt");

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  const CODE = await redis.get(body.email);
  if (Number(CODE) !== Number(body.code) || body.code == undefined) {
    return NextResponse.json({ message: "Invalid code" }, { status: 400 });
  }

  const result = passwordSchema.safeParse(body.password);

  if (!result.success) {
    const error = result.error.format()._errors[0];
    return NextResponse.json({ error: error }, { status: 400 });
  }

  const updateFields = {
    password: await bcrypt.hash(body.password, 10),
  };
  try {
    const key = (
      (await getByEmail(body.email, true)) as { user: User; key: string }
    ).key;
    await redis.hset(key, updateFields);
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 400 });
  }
}
