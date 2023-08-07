"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import styles from "@/styles/dashboard.module.css";
import OverallNav from "@/components/OverallNav";
import { errorToast } from "@/utils/toast";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DragComponent from "@/components/DragComponent";
import DropComponent from "@/components/DropComponent";
import { z } from "zod";
import DatePicker, { registerLocale } from "react-datepicker";
import enGB from "date-fns/locale/en-GB";
registerLocale("en-GB", enGB);

type Task = {
  title: string;
  date: string;
  description: string;
  type: string;
  priority: string;
};

type User = {
  password: String;
  tasks: Task[];
  email: String;
  name: String;
};

const titleSchema = z.string().max(40, { message: "Title too long" });
const descriptionSchema = z
  .string()
  .max(250, { message: "Description too long" });

async function getData() {
  const res = await fetch("/api/user");
  const data: { user: User } = await res.json();
  if (data.user == null) {
    window.location.href = window.location.href.replace(
      window.location.pathname,
      "/api/logout",
    );
  } else {
    data.user.tasks = data.user.tasks.map((task) => {
      task.date = task.date;
      return task;
    });
    return data.user;
  }
}

const Page = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [startDate2, setStartDate2] = useState(new Date());
  const [user, setUser] = useState<User>();
  const dialog = useRef<HTMLDialogElement>(null);
  const dialog2 = useRef<HTMLDialogElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const titleInput2 = useRef<HTMLInputElement>(null);
  const descriptionInput = useRef<HTMLTextAreaElement>(null);
  const descriptionInput2 = useRef<HTMLTextAreaElement>(null);
  const priorityInput = useRef<HTMLSelectElement>(null);
  const priorityInput2 = useRef<HTMLSelectElement>(null);
  const typeInput = useRef<HTMLSelectElement>(null);
  const editInput = useRef<number>(0);
  const addType = useRef<string>("");

  useEffect(() => {
    async function awaitPromise() {
      const data = await getData();
      setUser(data);
    }
    awaitPromise();
  }, []);

  function showModal(modal: Number) {
    if (modal === 1) {
      dialog.current!.style.display = "flex";
      dialog.current?.show();
    } else {
      dialog2.current!.style.display = "flex";
      dialog2.current?.show();
    }
  }

  function hideModal(modal: Number) {
    setStartDate(new Date());
    titleInput.current!.value = "";
    priorityInput.current!.value = "low";
    descriptionInput.current!.value = "";
    if (modal === 1) {
      dialog.current!.style.display = "none";
      dialog.current?.close();
    } else {
      dialog2.current!.style.display = "none";
      dialog2.current?.close();
    }
  }

  function checkValue(valueChecking: String, dialog: Number) {
    let symbols = /[^a-zA-Z0-9\s]/;
    let value;

    if (dialog === 1) {
      if (valueChecking === "Title") {
        value = titleInput.current?.value;
      } else if (valueChecking === "Date") {
        value = startDate;
        if (value == null) {
          errorToast(`${valueChecking} required`);
          return { error: true };
        } else {
          return { error: false };
        }
      } else {
        value = descriptionInput.current?.value;
      }
    } else {
      if (valueChecking === "Title") {
        value = titleInput2.current?.value;
      } else if (valueChecking === "Date") {
        value = startDate2;
        if (value == null) {
          errorToast(`${valueChecking} required`);
          return { error: true };
        } else {
          return { error: false };
        }
      } else {
        value = descriptionInput2.current?.value;
      }
    }

    if (value === "" || value == null || typeof value !== "string") {
      errorToast(`${valueChecking} required`);
      return { error: true };
    } else if (symbols.test(value) && valueChecking === "Title") {
      errorToast(`No symbols allowed in the ${valueChecking.toLowerCase()}`);
      return { error: true };
    } else {
      errorToast("");
      return { error: false };
    }
  }

  async function editTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    console.log(formValues);
    if (checkAllValues(formValues, 2).error === false) {
      const tasks = user?.tasks;
      if (tasks) {
        const yyyy: number | string = startDate2.getFullYear();
        let mm: number | string = startDate2.getMonth() + 1; // Months start at 0
        let dd: number | string = startDate2.getDate();

        if (dd < 10) dd = "0" + dd;
        if (mm < 10) mm = "0" + mm;

        const formatedDate = dd + "/" + mm + "/" + yyyy;
        tasks[editInput.current] = {
          title: String(formValues.title2),
          date: formatedDate,
          description: String(formValues.description2),
          priority: String(
            String(String(formValues.priority2)[0])
              .toUpperCase()
              .concat(String(formValues.priority2.slice(1))),
          ),
          type: String(formValues.type2),
        };
        await fetch("/api/user", {
          method: "PATCH",
          body: JSON.stringify({
            tasks: tasks,
          }),
        });
        const currentUser = JSON.parse(JSON.stringify(user));
        currentUser.tasks = tasks;
        setUser(currentUser);
      }
    }
    hideModal(2);
  }
  function formatDate(dateString: string) {
    const parts = dateString.split("/"); // Split the date string into day, month, and year parts
    const day = parseInt(parts[0], 10); // Convert the day part to an integer
    const month = parseInt(parts[1], 10) - 1; // Convert the month part to an integer (months in JavaScript are 0-based)
    const year = parseInt(parts[2], 10); // Convert the year part to an integer

    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dateObject = new Date(year, month, day); // Create a new Date object with the components

    const formattedDate = `${
      weekdays[dateObject.getDay()]
    } the ${day}${getOrdinalSuffix(day)} of ${months[dateObject.getMonth()]}`;
    return formattedDate;
  }

  function getOrdinalSuffix(day: number) {
    if (day >= 11 && day <= 13) {
      return "th";
    }
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  function checkLengths(title: string, description: string) {
    const titleResult = titleSchema.safeParse(title);
    const descriptionResult = descriptionSchema.safeParse(description);

    if (!titleResult.success || !descriptionResult.success) {
      if (!titleResult.success) {
        errorToast(titleResult.error.format()._errors[0]);
      }
      if (!descriptionResult.success) {
        errorToast(descriptionResult.error.format()._errors[0]);
      }
      return { error: true };
    } else {
      return { error: false };
    }
  }

  function checkAllValues(
    formValues: { [k: string]: FormDataEntryValue },
    index: number,
  ) {
    const results: boolean[] = [];
    if (index === 1) {
      results.push(
        checkLengths(String(formValues.title), String(formValues.description))
          .error,
      );
      results.push(checkValue("Title", 1).error);
      results.push(checkValue("Date", 1).error);
      results.push(checkValue("Description", 1).error);
    } else {
      results.push(
        checkLengths(String(formValues.title2), String(formValues.description2))
          .error,
      );
      results.push(checkValue("Title", 2).error);
      results.push(checkValue("Date", 2).error);
      results.push(checkValue("Description", 2).error);
    }
    const result = !results.every((val) => val === false);
    return { error: result };
  }

  async function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    if (checkAllValues(formValues, 1).error === false) {
      const tasks = user?.tasks;
      const yyyy: number | string = startDate.getFullYear();
      let mm: number | string = startDate.getMonth() + 1; // Months start at 0
      let dd: number | string = startDate.getDate();

      if (dd < 10) dd = "0" + dd;
      if (mm < 10) mm = "0" + mm;

      const formattedDate = dd + "/" + mm + "/" + yyyy;
      const newTask: Task = {
        title: String(formValues.title),
        date: formattedDate,
        priority: String(
          String(String(formValues.priority)[0])
            .toUpperCase()
            .concat(String(formValues.priority.slice(1))),
        ),
        description: String(formValues.description),
        type: addType.current,
      };
      tasks?.push(newTask);
      await fetch("/api/user", {
        method: "PATCH",
        body: JSON.stringify({ tasks: tasks }),
      });
      if (tasks) {
        const currentUser = JSON.parse(JSON.stringify(user));
        currentUser.tasks = tasks;
        setUser(currentUser);
      }
      hideModal(1);
    }
  }

  async function startEditTask(id: number) {
    const index = id;
    if (user) {
      priorityInput2.current!.value =
        user.tasks[index].priority.toLowerCase() || "";
      titleInput2.current!.value = user.tasks[index].title || "";
      descriptionInput2.current!.value = user.tasks[index].description || "";
      typeInput.current!.value = user.tasks[index].type || "";
      const parts = user.tasks[index].date.split("/"); // Split the date string into day, month, and year parts
      const day = parseInt(parts[0], 10); // Convert the day part to an integer
      const month = parseInt(parts[1], 10) - 1; // Convert the month part to an integer (months in JavaScript are 0-based)
      const year = parseInt(parts[2], 10); // Convert the year part to an integer and add 2000 (for YY format)

      const formattedDate = new Date(year, month, day);
      setStartDate2(formattedDate);
      editInput.current = index;
    }
    showModal(2);
  }

  async function deleteTask() {
    let tasks = user?.tasks;
    tasks?.splice(editInput.current, 1);

    await fetch("/api/user", {
      method: "PATCH",
      body: JSON.stringify({ tasks: tasks }),
    });
    const currentUser = JSON.parse(JSON.stringify(user));
    currentUser.tasks = tasks;
    setUser(currentUser);
    hideModal(2);
  }

  async function handleDrop(drag: { id: number; userParam: User }, drop: any) {
    const tasks = drag.userParam.tasks;
    const index = drag.id;
    if (tasks[index].type !== drop) {
      tasks[index].type = drop;
      await fetch("/api/user", {
        method: "PATCH",
        body: JSON.stringify({
          tasks: tasks,
        }),
      });
      const currentUser = JSON.parse(JSON.stringify(drag.userParam));
      currentUser.tasks = tasks;
      setUser(currentUser);
    }
  }

  function startAddUser(type: string) {
    addType.current = type;
    showModal(1);
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <>
        <OverallNav />
        <div className={styles.page}>
          <dialog className={styles.dialog} ref={dialog}>
            <form onSubmit={addTask} className={styles.form}>
              <label htmlFor="title">Title</label>
              <input
                autoComplete="off"
                ref={titleInput}
                name="title"
                id="title"
                type="text"
                placeholder="Work meeting"
              />
              <label htmlFor="date">Date</label>
              <DatePicker
                autoComplete="off"
                locale="en-GB"
                selected={startDate}
                onChange={(date: Date) => setStartDate(date)}
                minDate={new Date()}
                placeholderText="Select a date"
                className={styles.date}
                id="date"
              />
              <label htmlFor="description">Description</label>
              <textarea
                ref={descriptionInput}
                name="description"
                id="description"
                placeholder="Schedule  work meeting"
              />
              <label htmlFor="priority">Priority</label>
              <select name="priority" ref={priorityInput} id="priority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input type="submit" />
            </form>
            <button onClick={() => hideModal(1)} className={styles.backButton}>
              Back
            </button>
          </dialog>

          <dialog className={styles.dialog} ref={dialog2}>
            <form onSubmit={editTask} className={styles.form}>
              <label htmlFor="title2">Title</label>
              <input
                autoComplete="off"
                ref={titleInput2}
                name="title2"
                id="title2"
                type="text"
                placeholder="Work meeting"
              />
              <label htmlFor="date2">Date</label>
              <DatePicker
                autoComplete="off"
                selected={startDate2}
                onChange={(date: Date) => setStartDate2(date)}
                minDate={new Date()}
                placeholderText="Select a date"
                className={styles.date}
                id="date2"
              />
              <label htmlFor="description2">Description</label>
              <textarea
                ref={descriptionInput2}
                id="description2"
                name="description2"
                placeholder="Schedule work meeting"
              />
              <label htmlFor="type2">Type</label>
              <select name="type2" ref={typeInput} id="type2">
                <option value="to-do">To do</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
              <label htmlFor="priority2">Priority</label>
              <select name="priority2" ref={priorityInput2} id="priority2">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input type="submit" />
            </form>
            <div className={styles.bottomButton}>
              <button className={styles.back} onClick={() => hideModal(2)}>
                Back
              </button>
              <button className={styles.delete} onClick={deleteTask}>
                Delete
              </button>
            </div>
          </dialog>
          <title>Dashboard</title>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/react-datepicker/2.14.1/react-datepicker.min.css"
          />
          <div className={styles.container}>
            <div className={styles.tasks}>
              <DropComponent type={"to-do"} onDrop={handleDrop}>
                <div className={styles.todo}>
                  <div className={styles.sectionText}>
                    To do
                    <div
                      className={styles.addUser}
                      onClick={() => startAddUser("to-do")}
                    >
                      Add
                    </div>
                  </div>
                  {user &&
                    user.tasks?.filter((val) => val.type === "to-do").length ===
                      0 && <div>No tasks</div>}
                  {user &&
                    // Assuming the user.tasks array is stored in a state variable, e.g., tasks
                    user.tasks.map(
                      (task, index) =>
                        task.type === "to-do" &&
                        task.priority === "High" && (
                          <DragComponent
                            id={index}
                            userParam={user}
                            key={index}
                          >
                            <div
                              onClick={() => startEditTask(index)}
                              className={styles.task}
                            >
                              <p className={styles.taskTitle}>{task.title}</p>
                              <div className={styles.info}>
                                <p>{formatDate(task.date)}</p>
                                <p id={styles.high} className={styles.priority}>
                                  {task.priority}
                                </p>
                              </div>
                            </div>
                          </DragComponent>
                        ),
                    )}
                  {user &&
                    // Assuming the user.tasks array is stored in a state variable, e.g., tasks
                    user.tasks.map(
                      (task, index) =>
                        task.type === "to-do" &&
                        task.priority === "Medium" && (
                          <DragComponent
                            id={index}
                            userParam={user}
                            key={index}
                          >
                            <div
                              onClick={() => startEditTask(index)}
                              className={styles.task}
                            >
                              <p className={styles.taskTitle}>{task.title}</p>
                              <div className={styles.info}>
                                <p>{formatDate(task.date)}</p>
                                <p
                                  id={styles.medium}
                                  className={styles.priority}
                                >
                                  {task.priority}
                                </p>
                              </div>
                            </div>
                          </DragComponent>
                        ),
                    )}
                  {user &&
                    // Assuming the user.tasks array is stored in a state variable, e.g., tasks
                    user.tasks.map(
                      (task, index) =>
                        task.type === "to-do" &&
                        task.priority === "Low" && (
                          <DragComponent
                            id={index}
                            userParam={user}
                            key={index}
                          >
                            <div
                              onClick={() => startEditTask(index)}
                              className={styles.task}
                            >
                              <p className={styles.taskTitle}>{task.title}</p>
                              <div className={styles.info}>
                                <p>{formatDate(task.date)}</p>
                                <p id={styles.low} className={styles.priority}>
                                  {task.priority}
                                </p>
                              </div>
                            </div>
                          </DragComponent>
                        ),
                    )}
                </div>
              </DropComponent>

              <DropComponent type={"in-progress"} onDrop={handleDrop}>
                <div className={styles.ongoing}>
                  <div className={styles.sectionText}>
                    In progress
                    <div
                      className={styles.addUser}
                      onClick={() => startAddUser("in-progress")}
                    >
                      Add
                    </div>
                  </div>
                  {user &&
                    user.tasks?.filter((val) => val.type === "in-progress")
                      .length === 0 && <div>No tasks</div>}
                  {user &&
                    user.tasks.map(
                      (task, index) =>
                        task.type === "in-progress" &&
                        task.priority === "High" && (
                          <DragComponent
                            id={index}
                            userParam={user}
                            key={index}
                          >
                            <div
                              onClick={() => startEditTask(index)}
                              className={styles.task}
                            >
                              <p className={styles.taskTitle}>{task.title}</p>
                              <div className={styles.info}>
                                <p>{formatDate(task.date)}</p>
                                <p id={styles.high} className={styles.priority}>
                                  {task.priority}
                                </p>
                              </div>
                            </div>
                          </DragComponent>
                        ),
                    )}
                  {user &&
                    user.tasks.map(
                      (task, index) =>
                        task.type === "in-progress" &&
                        task.priority === "Medium" && (
                          <DragComponent
                            id={index}
                            userParam={user}
                            key={index}
                          >
                            <div
                              onClick={() => startEditTask(index)}
                              className={styles.task}
                            >
                              <p className={styles.taskTitle}>{task.title}</p>
                              <div className={styles.info}>
                                <p>{formatDate(task.date)}</p>
                                <p
                                  id={styles.medium}
                                  className={styles.priority}
                                >
                                  {task.priority}
                                </p>
                              </div>
                            </div>
                          </DragComponent>
                        ),
                    )}
                  {user &&
                    user.tasks.map(
                      (task, index) =>
                        task.type === "in-progress" &&
                        task.priority === "Low" && (
                          <DragComponent
                            id={index}
                            userParam={user}
                            key={index}
                          >
                            <div
                              onClick={() => startEditTask(index)}
                              className={styles.task}
                            >
                              <p className={styles.taskTitle}>{task.title}</p>
                              <div className={styles.info}>
                                <p>{formatDate(task.date)}</p>
                                <p id={styles.low} className={styles.priority}>
                                  {task.priority}
                                </p>
                              </div>
                            </div>
                          </DragComponent>
                        ),
                    )}
                </div>
              </DropComponent>
              <DropComponent type={"done"} onDrop={handleDrop}>
                <div className={styles.done}>
                  <div className={styles.sectionText}>
                    Done
                    <div
                      className={styles.addUser}
                      onClick={() => startAddUser("done")}
                    >
                      Add
                    </div>
                  </div>
                  {user &&
                    user.tasks?.filter((val) => val.type === "done").length ===
                      0 && <div>No tasks</div>}
                  {user &&
                    user.tasks.map(
                      (task, index) =>
                        task.type === "done" &&
                        task.priority === "High" && (
                          <DragComponent
                            id={index}
                            userParam={user}
                            key={index}
                          >
                            <div
                              onClick={() => startEditTask(index)}
                              className={styles.task}
                            >
                              <p className={styles.taskTitle}>{task.title}</p>
                              <div className={styles.info}>
                                <p>{formatDate(task.date)}</p>
                                <p id={styles.high} className={styles.priority}>
                                  {task.priority}
                                </p>
                              </div>
                            </div>
                          </DragComponent>
                        ),
                    )}
                  {user &&
                    user.tasks.map(
                      (task, index) =>
                        task.type === "done" &&
                        task.priority === "Medium" && (
                          <DragComponent
                            id={index}
                            userParam={user}
                            key={index}
                          >
                            <div
                              onClick={() => startEditTask(index)}
                              className={styles.task}
                            >
                              <p className={styles.taskTitle}>{task.title}</p>
                              <div className={styles.info}>
                                <p>{formatDate(task.date)}</p>
                                <p
                                  id={styles.medium}
                                  className={styles.priority}
                                >
                                  {task.priority}
                                </p>
                              </div>
                            </div>
                          </DragComponent>
                        ),
                    )}
                  {user &&
                    user.tasks.map(
                      (task, index) =>
                        task.type === "done" &&
                        task.priority === "Low" && (
                          <DragComponent
                            id={index}
                            userParam={user}
                            key={index}
                          >
                            <div
                              onClick={() => startEditTask(index)}
                              className={styles.task}
                            >
                              <p className={styles.taskTitle}>{task.title}</p>
                              <div className={styles.info}>
                                <p>{formatDate(task.date)}</p>
                                <p id={styles.low} className={styles.priority}>
                                  {task.priority}
                                </p>
                              </div>
                            </div>
                          </DragComponent>
                        ),
                    )}
                </div>
              </DropComponent>
            </div>
          </div>
        </div>
      </>
    </DndProvider>
  );
};

export default Page;
