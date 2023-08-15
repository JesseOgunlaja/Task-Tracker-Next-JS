import { connectToDB } from "@/utils/mongoDB";
import {
  emailSchema,
  passwordSchema,
  projectsSchema,
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

function isDateLowerThanMax(inputDate: string, index: number, user: any) {
  // Parse the input date string into a Date object
  const inputDateParts = inputDate.split("/");
  const year = parseInt(inputDateParts[2], 10);
  const month = parseInt(inputDateParts[1], 10) - 1; // Month is zero-based
  const day = parseInt(inputDateParts[0], 10);
  const parsedInputDate = new Date(year, month, day);

  const projectDate = user.projects[index].date
  const parts = projectDate.split("/")
  const day2 = parts[0];
  const month2 = parts[1] - 1;
  const year2 = parts[2];
  const maxDate = new Date(year2, month2, day2);

  return parsedInputDate <= maxDate;
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
    const {
      indexToDelete,
      editIndex,
      editedProject,
      newProject,
      index,
      name,
      email,
      password,
      tasks,
    } = body;

    const requestHeaders = headers();
    const id = requestHeaders.get("id");

    const updateFields: any = {};

    const user = await User.findById(id);

    const gmailUser = user.password === "GMAIL";

    if (name) {
      if (gmailUser) {
        return NextResponse.json(
          { message: "Can't change name for Gmail account" },
          { status: 400 }
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
          { status: 400 }
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
          { status: 400 }
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
    if (tasks != undefined && index != undefined) {
      if (typeof index !== "number" || user.projects[index].tasks == null) {
        return NextResponse.json({ message: "Invalid index" }, { status: 400 });
      }
      const newTasks: [] = tasks.map((task: any) => {
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
        const tasksCompleted = newTasks.filter(
          (task: any) => task.type === "done"
        ).length;
        const tasksLength = newTasks.length;
        const completionPercentage = (tasksCompleted / tasksLength) * 100;
        if (completionPercentage === 100 && tasksLength !== 0) {
          updateFields[`projects.${index}.section`] = "done";
        } else if (completionPercentage >= 50) {
          updateFields[`projects.${index}.section`] = "in-progress";
        } else {
          updateFields[`projects.${index}.section`] = "to-do";
        }
        const howManyOverMax = newTasks.filter((val: any) => !isDateLowerThanMax(switchDateFormat(val.date).split(" ")[0], index, user)).length
        // console.log(howManyOverMax)
        if(howManyOverMax === 0) {
          updateFields[`projects.${index}.tasks`] = newTasks.map((task: any) => {
            task.date = switchDateFormat(task.date);
            return task;
          });
        }
        else {
          return NextResponse.json({message: "Date over max, set by project date"})
        }
      }
    }
    if (newProject) {
      newProject.date = switchDateFormat(newProject.date);
      newProject.tasks = newProject.tasks.map((task: any) => {
        task.date = switchDateFormat(task.date);
        delete task._id;
        return task;
      });

      const result = projectsSchema.safeParse(newProject);
      if (result.success === false) {
        const error = result.error.issues.map((issue) => {
          return { error: issue.message };
        });
        return NextResponse.json({ errors: error }, { status: 400 });
      } else {
        newProject.date = switchDateFormat(newProject.date);
        const previousProjects = user.projects;
        previousProjects.push(newProject);
        updateFields.projects = previousProjects;
      }
    }
    if (editedProject != undefined && editIndex != undefined) {
      if (user.projects[editIndex] == null) {
        return NextResponse.json(
          { message: "Incorrect index" },
          { status: 400 }
        );
      } else {
        editedProject.date = switchDateFormat(editedProject.date);
        editedProject.tasks = editedProject.tasks.map((task: any) => {
          task.date = switchDateFormat(task.date);
          delete task._id;
          return task;
        });
        const result = projectsSchema.safeParse(editedProject);
        if (result.success === false) {
          const error = result.error.issues.map((issue) => {
            return { error: issue.message };
          });
          return NextResponse.json({ errors: error }, { status: 400 });
        } else {
          editedProject.date = switchDateFormat(editedProject.date);
          editedProject.tasks = editedProject.tasks.map((task: any) => {
            task.date = switchDateFormat(task.date);
            return task;
          });
          updateFields[`projects.${editIndex}`] = editedProject;
        }
      }
    }
    if (typeof indexToDelete === "number") {
      if (user.projects[indexToDelete] == null) {
        return NextResponse.json(
          { message: `Index ${indexToDelete} could not be found` },
          { status: 400 }
        );
      }
      const currentProjects: [any] = user.projects;
      currentProjects.splice(indexToDelete, 1);
      updateFields[`projects`] = currentProjects;
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
