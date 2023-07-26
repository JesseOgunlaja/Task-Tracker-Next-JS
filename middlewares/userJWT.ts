import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/utils/auth";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.REDIS_TOKEN || "",
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, "2 m"),
});

export async function userJWT(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
      const { success } =
        await ratelimit.limit(ip);

      if (!success) {
        return NextResponse.json(
          { message: "Rate limit" },
          { status: 429 }
        );
      }
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
