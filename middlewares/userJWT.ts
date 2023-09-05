import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/utils/auth";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/utils/redis";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, "2 m"),
});

export async function userJWT(request: NextRequest) {
  try {
    if (
      request.nextUrl.pathname.includes("/settingsChange") &&
      request.method === "PATCH"
    ) {
      const body = await request.json();
      if (body.createMagicLink == false) {
        if (body.code == undefined || body.email == undefined) {
          let message = [];
          if (body.code == undefined) {
            message.push("Code needed");
          }
          if (body.email == undefined) {
            message.push("Email needed");
          }
          return NextResponse.json({ message: message.join(" and ") });
        }
        const CODE = (await redis.get(body.email)) as string;
        if (CODE == undefined) {
          return NextResponse.json(
            { message: "Code expired" },
            { status: 400 },
          );
        }
        if (CODE.split(" ")[0] === body.code) {
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set("id", CODE.split(" ")[1]);
          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
        }
        var cookie = body.token;
      } else {
        var cookie: any = request.cookies.get("token")?.value;
      }
    } else {
      var cookie: any = request.cookies.get("token")?.value;
    }
    let decoded = await verifyJWT(String(cookie));
    if (decoded.payload.id && decoded.payload.uuid) {
      const requestHeaders = new Headers(request.headers);
      const uuid = await redis.hget(decoded.payload.id, "uuid");
      if (uuid === decoded.payload.uuid && uuid != null) {
        requestHeaders.set("id", decoded.payload.id);

        const ip = decoded.payload.id;
        const { success } = await ratelimit.limit(ip);

        if (!success) {
          return NextResponse.json(
            { message: "Too many requests from this IP" },
            { status: 429 },
          );
        }

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } else {
        return NextResponse.json({ message: `Invalid token` }, { status: 401 });
      }
    } else {
      const ip = request.ip ?? "127.0.0.1";
      const { success } = await ratelimit.limit(ip);

      if (!success) {
        return NextResponse.json(
          { message: "Too many requests from this IP" },
          { status: 429 },
        );
      }
      return NextResponse.json({ message: `Invalid token` }, { status: 401 });
    }
  } catch (err) {
    const ip = request.ip ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { message: "Too many requests from this IP" },
        { status: 429 },
      );
    }
    console.log(err);
    return NextResponse.json(
      { message: "Unathorized", pathname: request.headers.get("referer") },
      { status: 401 },
    );
  }
}
