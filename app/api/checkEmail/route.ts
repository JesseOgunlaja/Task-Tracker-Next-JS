import { User, getByEmail } from "@/utils/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const user = (await getByEmail((body.email as string).toLowerCase())) as User;

  if (user) {
    if (user.password !== "GMAIL") {
      return NextResponse.json(
        { success: true, email: user.email },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Can't reset password for GMAIL" },
        { status: 400 },
      );
    }
  } else {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
