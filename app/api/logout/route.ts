import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const expirationDate = new Date(new Date().getTime() - 1000000000);
    cookies().set({
      name: "token",
      value: "",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: expirationDate,
    });
    return NextResponse.redirect(new URL("/logIn", request.url));
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 500 });
  }
}
