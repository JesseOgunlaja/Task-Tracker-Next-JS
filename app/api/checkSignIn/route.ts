import { checkSignedIn } from "@/utils/checkSignedIn";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const signedIn = await checkSignedIn(request);
  return NextResponse.json({ result: signedIn }, { status: 200 });
}
