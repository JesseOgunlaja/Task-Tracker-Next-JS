import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDB } from "@/utils/mongoDB";
import { emailSchema, passwordSchema, usernameSchema } from "@/utils/zod";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
import { cookies } from "next/headers";
import { z } from "zod";

type ObjectResponse = {
  nameDuplicate?: Boolean;
  emailDuplicate?: Boolean;
};

export async function POST(request: NextRequest) {
  try {
    const User = await connectToDB();
    const body = await request.json();

    const requestHeaders = headers();
    const id = requestHeaders.get("id");

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    } else if (user.password === "GMAIL") {
      return NextResponse.json(
        { message: "Can't change data for Gmail account" },
        { status: 400 }
      );
    } else {
      const updateFields: any = {};
      if (body.name) {
        const result = usernameSchema.safeParse(body.name);
        if (!result.success) {
          return NextResponse.json(
            { message: result.error.format()._errors },
            { status: 400 }
          );
        } else {
          const name = body.name;
          if (user.name === name.toUpperCase()) {
            return NextResponse.json({ message: "Same" }, { status: 400 });
          } else {
            let duplicateUser = await User.findOne({
              name: name.toUpperCase(),
            });
            if (duplicateUser == null) {
              updateFields.name = body.name.toUpperCase();
            } else {
              return NextResponse.json(
                { message: "Duplicate" },
                { status: 400 }
              );
            }
          }
        }
      }
      if (body.email) {
        const result = emailSchema.safeParse(body.email);
        if (!result.success) {
          return NextResponse.json(
            { message: result.error.format()._errors },
            { status: 400 }
          );
        } else {
          const email = body.email;
          if (user.email === email.toLowerCase()) {
            return NextResponse.json({ message: "Same" }, { status: 400 });
          } else {
            const duplicateUser = await User.findOne({
              email: email.toLowerCase(),
            });
            if (duplicateUser == null) {
              updateFields.email = body.email.toLowerCase();
            } else {
              return NextResponse.json(
                { message: "Duplicate" },
                { status: 400 }
              );
            }
          }
        }
      }
      if (body.newPassword && body.oldPassword) {
        if (await bcrypt.compare(body.oldPassword, user.password)) {
          const result = passwordSchema.safeParse(body.newPassword);
          if (!result.success) {
            return NextResponse.json(
              { message: result.error.format()._errors },
              { status: 400 }
            );
          } else {
            if (body.newPassword === body.oldPassword) {
              return NextResponse.json({ message: "Same" }, { status: 400 });
            } else {
              const uuid = uuidv4();
              await fetch(`${process.env.REDIS_URL}/set/${user._id}/${uuid}`, {
                headers: {
                  Authorization: `Bearer ${process.env.REDIS_TOKEN}`,
                },
              });
              updateFields.password = await bcrypt.hash(body.newPassword, 10);
            }
          }
        } else {
          return NextResponse.json(
            { message: "Invalid credentials" },
            { status: 400 }
          );
        }
      }
      if (body.twoFactorAuth != undefined) {
        const schema = z.boolean();
        const result = schema.safeParse(body.twoFactorAuth);
        if (!result.success) {
          return NextResponse.json(
            { message: result.error.format()._errors },
            { status: 400 }
          );
        } else {
          updateFields.twoFactorAuth = body.twoFactorAuth;
        }
      }

      await User.updateOne({ _id: id }, { $set: updateFields });

      const res = await fetch(`${process.env.REDIS_URL}/get/${user._id}/`, {
        headers: {
          Authorization: `Bearer ${process.env.REDIS_TOKEN}`,
        },
      });
      const data = await res.json();
      const uuid = data.result;

      const payload = {
        iat: Date.now(),
        exp: Math.floor(
          (new Date().getTime() + 30 * 24 * 60 * 60 * 1000) / 1000
        ),
        username: updateFields.name || user.name,
        email: updateFields.email || user.email,
        id: user._id,
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

      return NextResponse.json(
        { user: updateFields, message: "Success" },
        { status: 200 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
