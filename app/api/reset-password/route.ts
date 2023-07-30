import { connectToDB } from "@/utils/mongoDB";
import { passwordSchema } from "@/utils/zod";
import { NextRequest, NextResponse } from "next/server";
const bcrypt = require("bcrypt");

export async function PATCH(request: NextRequest) {
  const User = await connectToDB();
  const body = await request.json();

  const result = passwordSchema.safeParse(body.password);

  if (!result.success) {
    const error = result.error.format()._errors[0];
    return NextResponse.json({ error: error }, { status: 400 });
  }

  const updateFields = {
    password: await bcrypt.hash(body.password, 10),
  };
  try {
    const result = await User.updateOne(
      { email: body.email },
      { $set: updateFields }
    );
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 400 });
  }
}
