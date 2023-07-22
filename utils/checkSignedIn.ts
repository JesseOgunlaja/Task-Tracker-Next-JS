import { NextRequest } from "next/server";
import { verifyJWT } from "@/utils/auth";

export async function checkSignedIn(req: NextRequest) {
    let cookie = req.cookies.get("token")?.value;
    if(cookie) {
        try {
          let decoded = await verifyJWT(String(cookie));
          if(decoded.payload.id) {
            return true;
          }
          else {
            return false;
          }
        } catch {
          return false;
        }
    }
    else {
        return false;
    }
}
