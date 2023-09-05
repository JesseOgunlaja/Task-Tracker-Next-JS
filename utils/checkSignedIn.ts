import { NextRequest } from "next/server";
import { verifyJWT } from "@/utils/auth";
import { redis } from "./redis";

export async function checkSignedIn(
  req: NextRequest | string,
  cookieDirect?: boolean,
) {
  if (cookieDirect === true && typeof req === "string") {
    var cookie = req as any;
  } else {
    if (typeof req !== "string") {
      var cookie = req.cookies.get("token")?.value as any;
    }
  }
  if (cookie) {
    try {
      let decoded = await verifyJWT(String(cookie));
      if (decoded.payload.id && decoded.payload.uuid) {
        const uuid = await redis.hget(decoded.payload.id, "uuid");
        if (uuid === decoded.payload.uuid && uuid != null) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch {
      return false;
    }
  } else {
    return false;
  }
}
