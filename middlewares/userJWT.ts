import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/utils/auth";

export async function userJWT(request: NextRequest) {
  try {
    let cookie = request.cookies.get("token")?.value;
    let decoded = await verifyJWT(String(cookie));
    if (decoded.payload.id) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("id", decoded.payload.id);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } else {
      return NextResponse.json({ message: `Invalid token` }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 401 });
  }
}
