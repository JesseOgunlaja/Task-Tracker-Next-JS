import { checkSignedIn } from "./utils/checkSignedIn";
import { globalJWT } from "./middlewares/globalJWT";
import { userJWT } from "./middlewares/userJWT";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  if (!String(request.nextUrl.pathname).includes("/api")) {
    const response = NextResponse.next();

    const signedIn = await checkSignedIn(request);
    response.cookies.set({
      name: "nav",
      value: signedIn ? "yes" : "no",
      secure: true,
      sameSite: "strict",
    });
    if (
      (String(request.nextUrl.pathname).includes("/logIn") ||
        String(request.nextUrl.pathname).includes("/reset-password")) &&
      (await checkSignedIn(request))
    ) {
      return NextResponse.redirect(new URL("/projects", request.url));
    }
    if (
      (String(request.nextUrl.pathname) === "/settings" ||
        String(request.nextUrl.pathname).includes("/projects") || String(request.nextUrl.pathname).includes("/tasks")) &&
      (await checkSignedIn(request)) === false
    ) {
      return NextResponse.redirect(new URL("/logIn", request.url));
    }
    response.cookies.set({
      name: "pathname",
      value: request.nextUrl.pathname,
      secure: true,
      sameSite: "strict",
    });
    return response;
  }
  if (
    String(request.nextUrl.pathname).includes("/api/user") ||
    String(request.nextUrl.pathname) === "/api/settingsChange"
  ) {
    return userJWT(request);
  }
  if (
    String(request.nextUrl.pathname).includes("/api/sendEmail") ||
    String(request.nextUrl.pathname).includes("/api/reset-password")
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
