import { NextRequest, NextResponse } from "next/server";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
import { cookies } from "next/headers";
import { checkSignedIn } from "@/utils/checkSignedIn";
import { User, getByEmail, getByName, redis } from "@/utils/redis";

export async function POST(req: NextRequest) {
  if (await checkSignedIn(req)) {
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } else {
    const body = await req.json();
    const username = body.username;
    const password = body.password;
    let user;
    let key;

    try {
      if (username.includes("@")) {
        const result = (await getByEmail(username, true)) as {
          user: User;
          key: string;
        };
        if (result != undefined) {
          user = result.user;
          key = result.key;
        } else {
          return NextResponse.json(
            { message: "Invalid credentials" },
            { status: 400 }
          );
        }
      } else {
        const result = (await getByName(username, true)) as {
          user: User;
          key: string;
        };
        if (result != undefined) {
          console.log("Hi");
          user = result.user;
          key = result.key;
        } else {
          return NextResponse.json(
            { message: "Invalid credentials" },
            { status: 400 }
          );
        }
      }
      if (await bcrypt.compare(password, user?.password)) {
        if (!user?.settings.twoFactorAuth) {
          const payload = {
            iat: Date.now(),
            exp: Math.floor(
              (new Date().getTime() + 30 * 24 * 60 * 60 * 1000) / 1000
            ),
            username: user?.name,
            email: user?.email,
            id: key,
            uuid: user?.uuid,
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
        }
        if (body.code != undefined) {
          console.log("hi");
          const CODE = await redis.get(user.email);
          if (body.code === Number(CODE)) {
            await redis.del(user.email);
            const uuid = await redis.hget(String(key), "uuid");
            const payload = {
              iat: Date.now(),
              exp: Math.floor(
                (new Date().getTime() + 30 * 24 * 60 * 60 * 1000) / 1000
              ),
              username: user.name,
              email: user.email,
              id: key,
              uuid: uuid,
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
              { message: "Invalid code" },
              { status: 400 }
            );
          }
        }
        return NextResponse.json(
          {
            message: "Success",
            twoFactorAuth: true,
            email: user.email,
            name: user.name,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { message: "Invalid credentials" },
          { status: 400 }
        );
      }
    } catch (err) {
      return NextResponse.json({ message: `${err}` }, { status: 400 });
    }
  }
}
