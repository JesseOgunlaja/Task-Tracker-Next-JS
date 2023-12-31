import { verifyJWT } from "@/utils/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.REDIS_TOKEN || "",
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "2 m"),
});

export async function globalJWT(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ message: "Rate limit" }, { status: 429 });
  }

  const headersList = new Headers(request.headers);
  let token = headersList.get("authorization");

  if (!headersList.get("authorization")) {
    return NextResponse.json(
      { message: "Access denied. No token provided" },
      { status: 401 },
    );
  }

  try {
    if (token === process.env.GLOBAL_KEY) {
      return NextResponse.next();
    } else {
      return NextResponse.json({ message: `Invalid token` }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ message: `Invalid token` }, { status: 401 });
  }
}
