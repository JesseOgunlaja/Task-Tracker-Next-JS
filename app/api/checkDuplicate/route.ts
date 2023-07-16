import { connectToDB } from "@/utils/mongoDB";
import { NextRequest, NextResponse } from "next/server";

type ObjectResponse = {
  nameDuplicate?: Boolean;
  emailDuplicate?: Boolean;
};

export async function POST(request: NextRequest) {
  const User = await connectToDB();

  const body = await request.json();
  const email = body.email;
  const name = body.name;
  let response: ObjectResponse = {};

    let user = await User.findOne({ name: name.toUpperCase() })
    if (user == null) {
      response.nameDuplicate = false;
    } else {
      response.nameDuplicate = true;
    }
    user = await User.findOne({ email: email.toLowerCase() })
    if (user == null) {
      response.emailDuplicate = false;
    } else {
      response.emailDuplicate = true;
    }
  
    return NextResponse.json(response, { status: 200 });
}
