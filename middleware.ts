import { checkSignedIn } from "./utils/checkSignedIn";
import { globalJWT } from "./middlewares/globalJWT";
import { userJWT } from "./middlewares/userJWT";
import { NextRequest, NextResponse } from "next/server";
import { getID } from "./middlewares/getID";

export async function middleware(request: NextRequest) {
  if (
    String(request.nextUrl.pathname) === "/logIn" &&
    (await checkSignedIn(request))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (
    String(request.nextUrl.pathname) === "/dashboard" &&
    (await checkSignedIn(request)) === false
  ) {
    return NextResponse.redirect(new URL("/logIn", request.url));
  }
  if (String(request.nextUrl.pathname).includes("/api/user")) {
    return userJWT(request);
  }
  if (
    String(request.nextUrl.pathname).includes("/api/sendEmail") ||
    String(request.nextUrl.pathname).includes("/api/reset-password")
  ) {
    return globalJWT(request);
  }
}
