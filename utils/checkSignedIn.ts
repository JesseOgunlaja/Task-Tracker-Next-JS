import { NextRequest } from "next/server";
import { verifyJWT } from "@/utils/auth";

export async function checkSignedIn(req: NextRequest) {
  let cookie = req.cookies.get("token")?.value;
  if (cookie) {
    try {
      let decoded = await verifyJWT(String(cookie));
      if (decoded.payload.id) {
        const res = await fetch(
          `${process.env.REDIS_URL}/get/${decoded.payload.id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.REDIS_TOKEN}`,
            },
          },
        );
        const data = await res.json();
        const uuid = data.result;
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
