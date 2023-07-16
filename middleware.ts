import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./utils/auth";

export async function middleware(request: NextRequest) {
  const headersList = new Headers(request.headers);
  let token = headersList.get("authorization");

  if (token?.startsWith("ThirdParty")) {
    token = token.replace("ThirdParty ", "");
    if (token === process.env.API_KEY) {
      return NextResponse.next();
    }
    else {
      return NextResponse.json(
        { message: `Invalid API key ${process.env.API_KEY}` },
        { status: 401 }
      );
    }
  } else {
    if (!headersList.get("authorization")) {
      return NextResponse.json(
        { message: "Access denied. No token provided" },
        { status: 401 }
      );
    }

    try {
      const decoded = await verifyJWT(request);
      if (decoded.payload.KEY === process.env.GLOBAL_KEY) {
        return NextResponse.next();
      } else {
        return NextResponse.json({ message: `Invalid token` }, { status: 401 });
      }
    } catch (error) {
      return NextResponse.json({ message: `Invalid token` }, { status: 401 });
    }
  }
}

export const config = {
  matcher: ["/api/sendEmail"],
};
