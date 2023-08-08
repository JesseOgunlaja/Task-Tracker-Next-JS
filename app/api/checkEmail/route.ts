import { connectToDB } from "@/utils/mongoDB";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const User = await connectToDB();

  const body = await request.json();

  const user = await User.findOne({ name: body.name.toUpperCase() });

  if (user) {
    if (user.password !== "GMAIL") {
      return NextResponse.json(
        { success: true, email: user.email },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Can't reset password for Gmail" },
        { status: 400 },
      );
    }
  } else {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}