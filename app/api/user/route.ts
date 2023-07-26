import { connectToDB } from "@/utils/mongoDB";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
const bcrypt = require("bcrypt");


export async function GET() {
  
  const User = await connectToDB();

  try {
    const requestHeaders = headers();
    const id = requestHeaders.get("id");
    const user = await User.findById(id);
    return NextResponse.json({ user: user }, { status: 200, headers: {'Cache-control': 'max-age=60'} });
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const User = await connectToDB();

  try {
    const body = await req.json();
    const { name, email, password, tasks } = body;

    const requestHeaders = headers();
    const id = requestHeaders.get("id");

    const updateFields: any = {};

    if (name) {
      updateFields.name = name.toUpperCase();
    }
    if (email) {
      updateFields.email = email;
    }
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }
    if (tasks) {
      updateFields.tasks = tasks;
    }

    const result = await User.updateOne({ _id: id }, { $set: updateFields });

    if (result.nModified === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    } else {
      return NextResponse.json({ user: updateFields }, { status: 200 });
    }
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 500 });
  }
}
