import { connectToDB } from "@/utils/mongoDB";
import {
  emailSchema,
  passwordSchema,
  tasksSchema,
  usernameSchema,
} from "@/utils/zod";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
const bcrypt = require("bcrypt");

function switchDateFormat(dateString: string) {
  const parts = dateString.split("/");

  const day = parts[1];
  const month = parts[0];
  const year = parts[2];

  return `${day}/${month}/${year}`;
}

export async function GET() {
  const User = await connectToDB();

  try {
    const requestHeaders = headers();
    const id = requestHeaders.get("id");
    const user = await User.findById(id);
    return NextResponse.json({ user: user }, { status: 200 });
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

    const gmailUser = (await User.findById(id)).password === "GMAIL";

    if (name) {
      if (gmailUser) {
        return NextResponse.json(
          { message: "Can't change name for Gmail account" },
          { status: 400 },
        );
      } else {
        const result = usernameSchema.safeParse(name);
        if (result.success === false) {
          const error = result.error.format()._errors[0];
          return NextResponse.json({ error: error }, { status: 400 });
        } else {
          updateFields.name = name.toUpperCase();
        }
      }
    }
    if (email) {
      if (gmailUser) {
        return NextResponse.json(
          { message: "Can't change email for Gmail account" },
          { status: 400 },
        );
      } else {
        const result = emailSchema.safeParse(email);

        if (result.success === false) {
          const error = result.error.format()._errors[0];
          return NextResponse.json({ error: error }, { status: 400 });
        } else {
          updateFields.email = email;
        }
      }
    }
    if (password) {
      if (gmailUser) {
        return NextResponse.json(
          { message: "Can't change password for Gmail account" },
          { status: 400 },
        );
      } else {
        const result = passwordSchema.safeParse(password);
        if (result.success === false) {
          const error = result.error.format()._errors[0];
          return NextResponse.json({ error: error }, { status: 400 });
        } else {
          updateFields.password = await bcrypt.hash(password, 10);
        }
      }
    }
    if (tasks) {
      const newTasks = tasks.map((task: any) => {
        task.date = switchDateFormat(task.date);
        delete task._id;
        return task;
      });
      const result = tasksSchema.safeParse(newTasks);
      if (result.success === false) {
        const error = result.error.issues.map((issue) => {
          return { error: issue.message };
        });
        return NextResponse.json({ errors: error }, { status: 400 });
      } else {
        updateFields.tasks = newTasks.map((task: any) => {
          task.date = switchDateFormat(task.date);
          return task;
        });
      }
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
