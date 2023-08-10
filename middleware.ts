import { checkSignedIn } from "./utils/checkSignedIn";
import { globalJWT } from "./middlewares/globalJWT";
import { userJWT } from "./middlewares/userJWT";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  if (
    String(request.nextUrl.pathname) === "/settings" &&
    (await checkSignedIn(request))
  ) {
    const response = NextResponse.next();
    let cookie = request.cookies.get("token")?.value;
    response.headers.set(
      "url",
      request.url.replace(request.nextUrl.pathname, "")
    );
    if (cookie) {
      response.headers.set("cookie", cookie);
    }
    return response;
  }
  if (
    String(request.nextUrl.pathname) === "/logIn" &&
    (await checkSignedIn(request))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (
    (String(request.nextUrl.pathname) === "/dashboard" ||
      String(request.nextUrl.pathname) === "/settings") &&
    (await checkSignedIn(request)) === false
  ) {
    return NextResponse.redirect(new URL("/logIn", request.url));
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
