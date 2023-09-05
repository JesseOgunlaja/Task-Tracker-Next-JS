import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    cookies().delete("token");
    return NextResponse.redirect(new URL("/logIn", request.url));
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 500 });
  }
}
