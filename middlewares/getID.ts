import { verifyJWT } from "@/utils/auth";
import type { NextRequest } from "next/server";

export async function getID(request: NextRequest) {
    let cookie = request.cookies.get("token")?.value;
    let decoded = await verifyJWT(String(cookie));
    return decoded.payload.id
}