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
  const dateFormat = user.settings.dateFormat;

  let dayIndex, monthIndex, yearIndex;
  if (dateFormat === "dd/MM/yyyy") {
    dayIndex = 0;
    monthIndex = 1;
    yearIndex = 2;
  } else if (dateFormat === "MM/dd/yyyy") {
    monthIndex = 0;
    dayIndex = 1;
    yearIndex = 2;
  } else if (dateFormat === "yyyy-MM-dd") {
    yearIndex = 0;
    monthIndex = 1;
    dayIndex = 2;
  } else {
    throw new Error("Invalid date format");
  }

  const parts = inputDate.split(/[-/]/); // Split the date string based on "-" or "/"

  const day = parseInt(parts[dayIndex], 10); // Convert the day part to an integer
  const month = parseInt(parts[monthIndex], 10) - 1; // Convert the month part to an integer (months in JavaScript are 0-based)
  const year = parseInt(parts[yearIndex], 10); // Convert the year part to an integer

  const parsedInputDate = new Date(year, month, day);

  const projectDate = user.projects[index].date;
  const parts2 = projectDate.split(/[-/]/);

  const day2 = parts2[dayIndex];
  const month2 = parts2[monthIndex] - 1;
  const year2 = parts2[yearIndex];
  const maxDate = new Date(year2, month2, day2);

  return parsedInputDate <= maxDate;
}

Array.prototype.sortByPriority = function () {
  return this.sort((a, b) => {
    // Sort tasks based on priority (High -> Medium -> Low)
    if (a.priority === "High" && b.priority !== "High") return -1;
    if (a.priority !== "High" && b.priority === "High") return 1;
    if (a.priority === "Medium" && b.priority !== "Medium") return -1;
    if (a.priority !== "Medium" && b.priority === "Medium") return 1;
    // If priorities are the same, preserve original index order
    return this.indexOf(a) - this.indexOf(b);
  });
};

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
      aloneTasks,
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
          { status: 400 },
        );
      } else {
        const result = usernameSchema.safeParse(name);
        if (result.success === false) {
          const error = result.error.issues.map((issue) => {
            return { error: issue.message };
          });
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
          const error = result.error.issues.map((issue) => {
            return { error: issue.message };
          });
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
          const error = result.error.issues.map((issue) => {
            return { error: issue.message };
          });
          return NextResponse.json({ error: error }, { status: 400 });
        } else {
          updateFields.password = await bcrypt.hash(password, 10);
        }
      }
    }

    if(aloneTasks) {
      const newTasks: [] = aloneTasks.map((task: any) => {
        if (user.settings.dateFormat === "dd/MM/yyyy") {
          task.date = switchDateFormat(task.date);
        }
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
        updateFields.tasks = newTasks.map(
          (task: any) => {
            if (user.settings.dateFormat === "dd/MM/yyyy") {
              task.date = switchDateFormat(task.date);
            }
            return task;
          },
        );
      }
    }
    if (tasks != undefined && index != undefined) {
      if (typeof index !== "number" || user.projects[index].tasks == null) {
        return NextResponse.json({ message: "Invalid index" }, { status: 400 });
      }
      const newTasks: [] = tasks.map((task: any) => {
        if (user.settings.dateFormat === "dd/MM/yyyy") {
          task.date = switchDateFormat(task.date);
        }
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
          (task: any) => task.type === "done",
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
        const howManyOverMax = newTasks.filter(
          (val: any) =>
            !isDateLowerThanMax(
              user.settings.dateFormat === "dd/MM/yyyy"
                ? switchDateFormat(val.date).split(" ")[0]
                : val.date.split(" ")[0],
              index,
              user,
            ),
        ).length;
        if (howManyOverMax === 0) {
          updateFields[`projects.${index}.tasks`] = newTasks.map(
            (task: any) => {
              if (user.settings.dateFormat === "dd/MM/yyyy") {
                task.date = switchDateFormat(task.date);
              }
              return task;
            },
          );
        } else {
          return NextResponse.json(
            { message: "Date over max, set by project date" },
            { status: 400 },
          );
        }
      }
    }
    if (newProject) {
      if (user.settings.dateFormat === "dd/MM/yyyy") {
        newProject.date = switchDateFormat(newProject.date);
      }
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
        if (
          user?.projects.filter(
            (val: any) =>
              val.name.toUpperCase() === newProject.name.toUpperCase(),
          ).length !== 0
        ) {
          return NextResponse.json(
            { message: "Duplicate task title" },
            { status: 400 },
          );
        } else {
          if (user.settings.dateFormat === "dd/MM/yyyy") {
            newProject.date = switchDateFormat(newProject.date);
          }
          const previousProjects: any[] = user.projects;
          previousProjects.push(newProject);
          updateFields.projects = previousProjects.sortByPriority();
        }
      }
    }
    if (editedProject != undefined && editIndex != undefined) {
      if (user.projects[editIndex] == null) {
        return NextResponse.json(
          { message: "Incorrect index" },
          { status: 400 },
        );
      } else {
        if (user.settings.dateFormat === "dd/MM/yyyy") {
          editedProject.date = switchDateFormat(editedProject.date);
        }
        editedProject.tasks = editedProject.tasks.map((task: any) => {
          if (user.settings.dateFormat === "dd/MM/yyyy") {
            task.date = switchDateFormat(task.date);
          }
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
          if (user.settings.dateFormat === "dd/MM/yyyy") {
            editedProject.date = switchDateFormat(editedProject.date);
          }
          editedProject.tasks = editedProject.tasks.map((task: any) => {
            if (user.settings.dateFormat === "dd/MM/yyyy") {
              task.date = switchDateFormat(task.date);
            }
            return task;
          });
          if (
            user?.projects.filter((val: any, index: number) =>
              index === editIndex
                ? false
                : val.name.toUpperCase() === editedProject.name.toUpperCase(),
            ).length !== 0
          ) {
            return NextResponse.json(
              { message: "Duplicate task title" },
              { status: 400 },
            );
          } else {
            updateFields[`projects.${editIndex}`] = editedProject;
          }
        }
      }
    }
    if (typeof indexToDelete === "number") {
      if (user.projects[indexToDelete] == null) {
        return NextResponse.json(
          { message: `Index ${indexToDelete} could not be found` },
          { status: 400 },
        );
      }
      const currentProjects: any[] = user.projects;
      currentProjects.splice(indexToDelete, 1);
      updateFields[`projects`] = currentProjects.sortByPriority();
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
