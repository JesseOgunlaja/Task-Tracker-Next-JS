import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDB } from "@/utils/mongoDB";
import { emailSchema, passwordSchema, usernameSchema } from "@/utils/zod";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
import { cookies } from "next/headers";
import { z } from "zod";

function convertDateFormat(
  dateString: string,
  user: any,
  body: any,
  showTime: boolean,
) {
  const currentFormat = user?.settings.dateFormat;
  const targetFormat = body?.dateFormat;

  if (!currentFormat || !targetFormat) {
    throw new Error("Current or target date format missing");
  }

  const parts = dateString.split(/[ /-]/);
  const currentPartsOrder = currentFormat.split(/[/-]/);

  const dayIndex = currentPartsOrder.indexOf("dd");
  const monthIndex = currentPartsOrder.indexOf("MM");
  const yearIndex = currentPartsOrder.indexOf("yyyy");

  const day = parseInt(parts[dayIndex], 10);
  const month = parseInt(parts[monthIndex], 10) - 1;
  const year = parseInt(parts[yearIndex], 10);

  const targetPartsOrder = targetFormat.split(/[/-]/);

  let formattedDate = "";
  targetPartsOrder.forEach((part: any) => {
    if (part === "dd") {
      formattedDate += day.toString().padStart(2, "0");
    } else if (part === "MM") {
      formattedDate += (month + 1).toString().padStart(2, "0");
    } else if (part === "yyyy") {
      formattedDate += year.toString();
    } else {
      throw new Error("Invalid date format");
    }
    formattedDate += targetFormat.includes("-") ? "-" : "/";
  });

  formattedDate = formattedDate.slice(0, -1);
  if (showTime) {
    if (dateString.includes(" ")) {
      formattedDate += ` ${dateString.split(" ")[1]}`;
    }
  }

  return formattedDate;
}

export async function PATCH(request: NextRequest) {
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
        { status: 400 },
      );
    } else {
      const updateFields: any = {};
      if (body.name) {
        const result = usernameSchema.safeParse(body.name);
        if (!result.success) {
          const error = result.error.issues.map((issue) => {
            return { error: issue.message };
          });
          return NextResponse.json({ errors: error }, { status: 400 });
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
                { status: 400 },
              );
            }
          }
        }
      }
      if (body.email) {
        const result = emailSchema.safeParse(body.email);
        if (!result.success) {
          const error = result.error.issues.map((issue) => {
            return { error: issue.message };
          });
          return NextResponse.json({ errors: error }, { status: 400 });
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
                { status: 400 },
              );
            }
          }
        }
      }
      if (
        body.newPassword &&
        body.oldPassword &&
        body.keepSessions != undefined
      ) {
        if (await bcrypt.compare(body.oldPassword, user.password)) {
          const result = passwordSchema.safeParse(body.newPassword);
          if (!result.success) {
            return NextResponse.json(
              { message: result.error.format()._errors },
              { status: 400 },
            );
          } else {
            if (body.newPassword === body.oldPassword) {
              return NextResponse.json({ message: "Same" }, { status: 400 });
            } else {
              if (body.keepSessions === true) {
                const uuid = uuidv4();
                await fetch(
                  `${process.env.REDIS_URL}/set/${user._id}/${uuid}`,
                  {
                    headers: {
                      Authorization: `Bearer ${process.env.REDIS_TOKEN}`,
                    },
                  },
                );
              }
              updateFields.password = await bcrypt.hash(body.newPassword, 10);
            }
          }
        } else {
          return NextResponse.json(
            { message: "Invalid credentials" },
            { status: 400 },
          );
        }
      }
      if (body.twoFactorAuth != undefined) {
        const schema = z.boolean();
        const result = schema.safeParse(body.twoFactorAuth);
        if (!result.success) {
          const error = result.error.issues.map((issue) => {
            return { error: issue.message };
          });
          return NextResponse.json({ errors: error }, { status: 400 });
        } else {
          if (body.twoFactorAuth === user.settings.twoFactorAuth) {
            return NextResponse.json({ message: "Same" }, { status: 400 });
          } else {
            updateFields["settings.twoFactorAuth"] = body.twoFactorAuth;
          }
        }
      }
      if (body.timeFormat) {
        const timeFormatSchema = z.union([z.literal(12), z.literal(24)]);
        const result = timeFormatSchema.safeParse(body.timeFormat);
        if (!result.success) {
          const error = result.error.issues.map((issue) => {
            return { error: issue.message };
          });
          return NextResponse.json({ errors: error }, { status: 400 });
        } else {
          if (body.timeFormat === user.settings.timeFormat) {
            return NextResponse.json({ message: "Same" }, { status: 400 });
          } else {
            updateFields["settings.timeFormat"] = body.timeFormat;
          }
        }
      }
      if (body.calendars) {
        const calendarsSchema = z.array(
          z.string().min(1, {
            message: "Calendar can't be empty string",
          }),
        );
        const result = calendarsSchema.safeParse(body.calendars);
        if (!result.success) {
          const error = result.error.issues.map((issue) => {
            return { error: issue.message };
          });
          return NextResponse.json({ errors: error }, { status: 400 });
        } else {
          if (
            JSON.stringify(body.calendars) ===
            JSON.stringify(user.settings.calendars)
          ) {
            return NextResponse.json({ message: "Same" }, { status: 400 });
          } else {
            if (body.calendars.length === user.settings.calendars.length) {
              const newProjects = user.projects.map((project: any) => {
                const indexOfSection = user.settings.calendars.indexOf(
                  project.type,
                );
                project.type = body.calendars[indexOfSection];
                return project;
              });
              updateFields["projects"] = newProjects;
            }
            if (
              user.projects.filter((val: any) =>
                body.calendars.includes(val.type),
              ).length !== user.projects.length
            ) {
              return NextResponse.json(
                {
                  message: "Remove all projects with type before removing tag",
                },
                { status: 400 },
              );
            }
            updateFields["settings.calendars"] = body.calendars;
          }
        }
      }
      if (body.dateFormat) {
        const dateFormatSchema = z.union([
          z.literal("yyyy-MM-dd"),
          z.literal("MM/dd/yyyy"),
          z.literal("dd/MM/yyyy"),
        ]);
        const result = dateFormatSchema.safeParse(body.dateFormat);
        if (!result.success) {
          return NextResponse.json(
            { message: "Invalid input" },
            { status: 400 },
          );
        } else {
          if (body.dateFormat === user.settings.dateFormat) {
            return NextResponse.json({ message: "Same" }, { status: 400 });
          } else {
            const newProjects = user.projects.map((project: any) => {
              project.date = convertDateFormat(project.date, user, body, false);
              project.tasks = project.tasks.map((task: any) => {
                task.date = convertDateFormat(task.date, user, body, true);
                return task;
              });
              return project;
            });
            updateFields["projects"] = newProjects;
            updateFields["settings.dateFormat"] = body.dateFormat;
          }
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
          (new Date().getTime() + 30 * 24 * 60 * 60 * 1000) / 1000,
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
        { status: 200 },
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 },
    );
  }
}
