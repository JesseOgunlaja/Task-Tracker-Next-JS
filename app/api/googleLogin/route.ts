import { connectToDB } from "@/utils/mongoDB";
import { NextRequest, NextResponse } from "next/server";
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const client = new OAuth2Client(
  "127574879175-5f5ath1lrnqnc83t4tntdv30i8s92amu.apps.googleusercontent.com",
);
import { cookies } from "next/headers";
const { v4: uuidv4 } = require("uuid");

export async function POST(req: NextRequest) {
  const User = await connectToDB();

  const body = await req.json();

  try {
    const googleJwt = body.credentials.credential;
    const ticket = (
      await client.verifyIdToken({
        idToken: googleJwt,
        audience:
          "127574879175-5f5ath1lrnqnc83t4tntdv30i8s92amu.apps.googleusercontent.com",
      })
    ).getPayload();

    let checkUser;

    checkUser = await User.findOne({ email: ticket.email.toLowerCase() });
    if (checkUser != null && checkUser.password !== "GMAIL") {
      return NextResponse.json({ message: "Email in use" }, { status: 400 });
    } else {
      if (checkUser == null) {
        const user = new User({
          name: "GMAIL_".concat(ticket.email.split("@")[0]),
          email: ticket.email,
          password: "GMAIL",
        });

        const newUser = await user.save();
        const uuid = uuidv4();
        await fetch(`${process.env.REDIS_URL}/set/${newUser._id}/${uuid}`, {
          headers: {
            Authorization: `Bearer ${process.env.REDIS_TOKEN}`,
          },
        });

        const payload = {
          iat: Date.now(),
          exp: Math.floor(
            (new Date().getTime() + 30 * 24 * 60 * 60 * 1000) / 1000,
          ),
          username: newUser.name,
          email: newUser.email,
          id: newUser._id,
          uuid: uuid,
        };
        const token = jwt.sign(payload, process.env.SECRET_KEY);
        const expirationDate = new Date();
        expirationDate.setSeconds(
          expirationDate.getSeconds() + 30 * 24 * 60 * 60 * 1000,
        );
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
        if (checkUser.password !== "GMAIL") {
          return NextResponse.json(
            { message: "Account isn't registered with GMAIL" },
            { status: 400 },
          );
        } else {
          const res = await fetch(
            `${process.env.REDIS_URL}/get/${checkUser._id}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.REDIS_TOKEN}`,
              },
            },
          );
          const data = await res.json();
          const uuid = data.result;
          const payload = {
            iat: Date.now(),
            exp: Math.floor(
              (new Date().getTime() + 30 * 24 * 60 * 60 * 1000) / 1000,
            ),
            username: checkUser.name,
            email: checkUser.email,
            id: checkUser._id,
            uuid: uuid,
          };
          const token = jwt.sign(payload, process.env.SECRET_KEY);
          const expirationDate = new Date();
          expirationDate.setSeconds(
            expirationDate.getSeconds() + 30 * 24 * 60 * 60 * 1000,
          );
          cookies().set({
            name: "token",
            value: token,
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            expires: expirationDate,
          });
          return NextResponse.json({ message: "Success" }, { status: 200 });
        }
      }
    }
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 400 });
  }
}
