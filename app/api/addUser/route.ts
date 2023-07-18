import { connectToDB } from "@/utils/mongoDB";
import { NextRequest, NextResponse } from "next/server";
const bcrypt = require("bcrypt");


export async function POST(req: NextRequest) {
  const User = await connectToDB();

  const body = await req.json();

  const user = new User({
    name: body.name.toUpperCase(),
    email: body.email.toLowerCase(),
    password: await bcrypt.hash(body.password, 10),
    tasks: [],
  });
  try {
    const newUser = await user.save();
    return NextResponse.json({ newUser, message: "Success" }, { status: 201 });
  } catch (error: any) {
    if (error.message.includes("duplicate")) {
      if (error.message.includes("email")) {
        return NextResponse.json(
          { message: `Duplicate email` },
          { status: 400 }
        );
      } else if (error.message.includes("name")) {
        return NextResponse.json(
          { message: `Duplicate name` },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json({ error: error }, { status: 400 });
    }
  }
}
