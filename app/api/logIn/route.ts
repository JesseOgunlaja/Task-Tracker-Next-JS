import { connectToDB } from "@/utils/mongoDB";
import { NextRequest, NextResponse } from "next/server";
const bcrypt = require("bcrypt");

export async function POST(req: NextRequest) {
  const User = await connectToDB();

  const body = await req.json();
  const username = body.username;
  const password = body.password;
  let user;

  try {
    if (username.includes("@")) {
      user = await User.findOne({ email: username.toLowerCase() });
    } else {
      user = await User.findOne({ name: username.toUpperCase() });
    }

    if (await bcrypt.compare(password, user.password)) {
      return NextResponse.json({ message: "Success" }, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 400 }
    );
  }
}
