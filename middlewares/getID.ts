import { verifyJWT } from "@/utils/auth";
import type { NextRequest } from "next/server";

export async function getID(request: NextRequest) {
  const cookie = request.cookies.get("token")?.value;
  const decoded = await verifyJWT(String(cookie));
  return decoded.payload.id;
}
