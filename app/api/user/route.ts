import { User, redis } from "@/utils/redis";
import { projectsSchema, tasksSchema } from "@/utils/zod";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function switchDateFormat(dateString: string) {
  const parts = dateString.split("/");

  const day = parts[1];
  const month = parts[0];
  const year = parts[2];

  return `${day}/${month}/${year}`;
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

export async function GET() {
  try {
    const requestHeaders = headers();
    const id = requestHeaders.get("id");
    const user = await redis.hgetall(String(id));
    return NextResponse.json({ user: user }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      aloneTasks,
      indexToDelete,
      editIndex,
      editedProject,
      newProject,
      index,
      tasks,
    } = body;

    const requestHeaders = headers();
    const id = requestHeaders.get("id");

    const updateFields: any = {};

    const user = (await redis.hgetall(String(id))) as User;

    if (aloneTasks) {
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
        updateFields.tasks = newTasks.map((task: any) => {
          if (user.settings.dateFormat === "dd/MM/yyyy") {
            task.date = switchDateFormat(task.date);
          }
          return task;
        });
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
        const howManyOverMax = newTasks.filter(
          (val: any) =>
            !isDateLowerThanMax(
              user.settings.dateFormat === "dd/MM/yyyy"
                ? switchDateFormat(val.date).split(" ")[0]
                : val.date.split(" ")[0],
              index,
              user
            )
        ).length;
        if (howManyOverMax === 0) {
          const currentProjects = user.projects;
          const tasksCompleted = newTasks.filter(
            (task: any) => task.type === "done"
          ).length;
          const tasksLength = newTasks.length;
          const completionPercentage = (tasksCompleted / tasksLength) * 100;
          if (completionPercentage === 100 && tasksLength !== 0) {
            currentProjects[index].section = "done";
          } else if (completionPercentage >= 50) {
            currentProjects[index].section = "in-progress";
          } else {
            currentProjects[index].section = "to-do";
          }
          currentProjects[index].tasks = newTasks.map((task: any) => {
            if (user.settings.dateFormat === "dd/MM/yyyy") {
              task.date = switchDateFormat(task.date);
            }
            return task;
          });
          updateFields.projects = currentProjects;
        } else {
          return NextResponse.json(
            { message: "Date over max, set by project date" },
            { status: 400 }
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
              val.name.toUpperCase() === newProject.name.toUpperCase()
          ).length !== 0
        ) {
          return NextResponse.json(
            { message: "Duplicate task title" },
            { status: 400 }
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
          { status: 400 }
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
                : val.name.toUpperCase() === editedProject.name.toUpperCase()
            ).length !== 0
          ) {
            return NextResponse.json(
              { message: "Duplicate task title" },
              { status: 400 }
            );
          } else {
            const newTasks = user.projects;
            newTasks[editIndex] = editedProject;
            updateFields["projects"] = newTasks;
          }
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
      const currentProjects: any[] = user.projects;
      currentProjects.splice(indexToDelete, 1);
      updateFields[`projects`] = currentProjects.sortByPriority();
    }

    await redis.hset(String(id), updateFields);

    return NextResponse.json({ user: updateFields }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const requestHeaders = headers();
    const id = requestHeaders.get("id");

    const expirationDate = new Date(new Date().getTime() - 1000000000);
    cookies().set({
      name: "token",
      value: "",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: expirationDate,
    });
    cookies().set({
      name: "credentials",
      value: "",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: expirationDate,
    });

    await redis.del(String(id));

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 500 });
  }
}
