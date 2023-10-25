import { NextRequest, NextResponse } from "next/server";
const jwt = require("jsonwebtoken");
import { cookies } from "next/headers";
import { User, getByEmail, redis } from "@/utils/redis";
const { v4: uuidv4 } = require("uuid");

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const googleJWT = body.googleCode;
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${googleJWT}` },
    });
    const data = await res.json();
    const email = data.email.toLowerCase();

    const result = (await getByEmail(email, true)) as {
      user: User;
      key: string;
    };
    const checkUser = result?.user;
    const key = result?.key;
    if (checkUser != null && checkUser.password !== "GMAIL") {
      return NextResponse.json({ message: "Email in use" }, { status: 400 });
    } else {
      if (checkUser == null) {
        const uuid1 = uuidv4();
        const user: User = {
          uuid: uuid1,
          name: email,
          tasks: [],
          projects: [],
          email: email,
          password: "GMAIL",
          settings: {
            twoFactorAuth: false,
            timeFormat: 12,
            dateFormat: "dd/MM/yyyy",
            calendars: ["Home", "Work", "Personal"],
          },
        };
        const uuid2 = uuidv4();

        await redis.hset(uuid2, user);
        await redis.rpush("Username and emails", {
          name: email,
          email: email,
          id: uuid2,
        });

        const payload = {
          iat: Date.now(),
          exp: Math.floor(
            (new Date().getTime() + 30 * 24 * 60 * 60 * 1000) / 1000
          ),
          username: user.name,
          email: user.email,
          uuid: uuid1,
          id: uuid2,
        };
        const token = jwt.sign(payload, process.env.SECRET_KEY);
        const expirationDate = new Date();
        expirationDate.setSeconds(
          expirationDate.getSeconds() + 30 * 24 * 60 * 60 * 1000
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
            { status: 400 }
          );
        } else {
          const uuid = await redis.hget(key, "uuid");
          const payload = {
            iat: Date.now(),
            exp: Math.floor(
              (new Date().getTime() + 30 * 24 * 60 * 60 * 1000) / 1000
            ),
            username: checkUser.name,
            email: checkUser.email,
            id: key,
            uuid: uuid,
          };
          const token = jwt.sign(payload, process.env.SECRET_KEY);
          const expirationDate = new Date();
          expirationDate.setSeconds(
            expirationDate.getSeconds() + 30 * 24 * 60 * 60 * 1000
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
