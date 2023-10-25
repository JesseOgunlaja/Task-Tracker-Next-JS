import { getByEmail, getByName, redis } from "@/utils/redis";
import { NextRequest, NextResponse } from "next/server";

type ObjectResponse = {
  nameDuplicate?: Boolean;
  emailDuplicate?: Boolean;
};

export async function POST(request: NextRequest) {
  try {
    console.time("Whole request");
    const body = await request.json();
    const email = body.email;
    const name = body.name;
    let response: ObjectResponse = {};
    console.time("Username");
    let user = await getByName(name.toUpperCase());
    console.timeEnd("Username");
    if (user == undefined) {
      response.nameDuplicate = false;
    } else {
      response.nameDuplicate = true;
    }
    console.time("Email");
    user = await getByEmail(email.toLowerCase());
    console.timeEnd("Email");
    if (user == undefined) {
      response.emailDuplicate = false;
    } else {
      response.emailDuplicate = true;
    }
    console.timeEnd("Whole request");
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 500 });
  }
}
