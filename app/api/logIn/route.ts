import { connectToDB } from "@/utils/mongoDB";
import { NextRequest, NextResponse } from "next/server";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
import { cookies } from "next/headers";
import { checkSignedIn } from "@/utils/checkSignedIn";

export async function POST(req: NextRequest) {
  if (await checkSignedIn(req)) {
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } else {
    const User = await connectToDB();

    const body = await req.json();
    const username = body.username;
    const password = body.password;
    let user;

    try {
      if (username.includes("@")) {
        user = await User.findOne({ email: username.toLowerCase() });
      } else {
        user = await User.findOne({ name: username.toUpperCase() });
      }

      if (await bcrypt.compare(password, user.password)) {
        const payload = {
          iat: Date.now(),
          exp: Math.floor(
            (new Date().getTime() + 30 * 24 * 60 * 60 * 1000) / 1000
          ),
          username: user.name,
          email: user.email,
          id: user._id,
        };
        const token = jwt.sign(payload, process.env.SECRET_KEY);
        const expirationDate = new Date();
        expirationDate.setSeconds(expirationDate.getSeconds() + 2592000);
        cookies().set({
          name: "token",
          value: token,
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          expires: expirationDate,
        });
        return NextResponse.json({ message: "Success" }, { status: 200 });
      } else {
        return NextResponse.json(
          { message: "Invalid credentials" },
          { status: 400 }
        );
      }
    } catch (err) {
      return NextResponse.json({ error: `${err}` }, { status: 400 });
    }
  }
}
