import { checkSignedIn } from "./utils/checkSignedIn";
import { globalJWT } from "./middlewares/globalJWT";
import { userJWT } from "./middlewares/userJWT";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = String(request.nextUrl.pathname);
  console.log(request.cookies.get("token"));
  if (
    (pathname.includes("/logIn") || pathname.includes("/reset-password")) &&
    (await checkSignedIn(request))
  ) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }
  if (
    (pathname === "/settings" ||
      pathname.includes("/projects") ||
      pathname.includes("/tasks")) &&
    (await checkSignedIn(request)) === false
  ) {
    return NextResponse.redirect(new URL("/logIn", request.url));
  }

  if (pathname.includes("/api/user") || pathname === "/api/settingsChange") {
    return userJWT(request);
  }
  if (
    pathname.includes("/api/sendEmail") ||
    pathname.includes("/api/reset-password")
  ) {
    return globalJWT(request);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
