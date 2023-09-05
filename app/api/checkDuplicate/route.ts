import { getByEmail, getByName } from "@/utils/redis";
import { NextRequest, NextResponse } from "next/server";

type ObjectResponse = {
  nameDuplicate?: Boolean;
  emailDuplicate?: Boolean;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email;
    const name = body.name;
    let response: ObjectResponse = {};

    let user = await getByName(name.toUpperCase());
    if (user == undefined) {
      response.nameDuplicate = false;
    } else {
      response.nameDuplicate = true;
    }
    user = await getByEmail(email.toLowerCase());
    if (user == undefined) {
      response.emailDuplicate = false;
    } else {
      response.emailDuplicate = true;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 500 });
  }
}
