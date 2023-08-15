"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "@/styles/projectPage.module.css";
import { errorToast } from "@/utils/toast";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DragComponent from "@/components/DragComponent";
import DropComponent from "@/components/DropComponent";
import { z } from "zod";
import DatePicker from "react-datepicker";
import { useParams } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";

type Task = {
  title: string;
  date: string;
  description: string;
  type: string;
  priority: string;
};

type Project = {
  name: string;
  type: string;
  date: string;
  tasks: Task[];
};

type User = {
  projects: Project[];
  password: String;
  email: String;
  name: String;
  settings: {
    timeFormat: 12 | 24;
  };
};

const titleSchema = z.string().max(40, { message: "Title too long" });
const descriptionSchema = z
  .string()
  .max(250, { message: "Description too long" });

async function getData(id: number) {
  const res = await fetch("/api/user");
  const data: { user: User } = await res.json();
  if (data.user == null) {
    window.location.href = window.location.href.replace(
      window.location.pathname,
      "/api/logout"
    );
  } else {
    if (data.user.projects[id] == null) {
      window.location.href = window.location.href.replace(
        window.location.pathname,
        "/pageNotFound"
      );
    } else {
      return data.user;
    }
  }
}

const Page = () => {
  const id = Number(useParams().id);

  const [startDate, setStartDate] = useState(new Date());
  const [startDate2, setStartDate2] = useState(new Date());
  const [searchField, setSearchField] = useState<string>("");
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

  useEffect(() => {
    async function awaitPromise() {
      const data = await getData(id);
      setUser(data);
    }
    awaitPromise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (checkAllValues(formValues, 2).error === false) {
      let tasks;
      if (user?.projects[id].tasks) {
        tasks = [...user?.projects[id].tasks];
      }
      if (tasks) {
        const yyyy: number | string = startDate2.getFullYear();
        let mm: number | string = startDate2.getMonth() + 1; // Months start at 0
        let dd: number | string = startDate2.getDate();

        if (dd < 10) dd = "0" + dd;
        if (mm < 10) mm = "0" + mm;

        const hh: number | string = startDate2.getHours();
        const mins: number | string = startDate2.getMinutes();

        const formattedDate = `${dd}/${mm}/${yyyy} ${hh
          .toString()
          .padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

        tasks[editInput.current] = {
          title: String(formValues.title2),
          date: formattedDate,
          description: String(formValues.description2),
          priority: String(
            String(String(formValues.priority2)[0])
              .toUpperCase()
              .concat(String(formValues.priority2.slice(1)))
          ),
          type: String(formValues.type2),
        };
        const res = await fetch("/api/user", {
          method: "PATCH",
          body: JSON.stringify({
            tasks: tasks,
            index: id,
          }),
        });
        const data = await res.json();
        console.log(data.user);
        if (data.user != undefined && Object.keys(data.user).length !== 0) {
          const currentUser = JSON.parse(JSON.stringify(user));
          currentUser.projects[id].tasks = tasks;
          setUser(currentUser);
          hideModal(2);
        } else {
          if (data.message === "Date over max, set by project date") {
            errorToast("Date exceedes, the date set in project");
          } else {
            errorToast("An error occurred. Please try again.");
          }
        }
      }
    }
  }
  function formatDate(dateString: string) {
    if (user?.settings.timeFormat === 24) {
      const parts = dateString.split(" ")[0].split("/"); // Split the date string into day, month, and year parts
      const day = parseInt(parts[0], 10); // Convert the day part to an integer
      const month = parseInt(parts[1], 10) - 1; // Convert the month part to an integer (months in JavaScript are 0-based)
      const year = parseInt(parts[2], 10); // Convert the year part to an integer
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

      const formattedDate = `${months[dateObject.getMonth()]} ${day}, ${year}`;
      return formattedDate.concat(" " + dateString.split(" ")[1]);
    } else {
      const parts = dateString.split("/"); // Split the date string into day, month, and year parts
      const day = parseInt(parts[0], 10); // Convert the day part to an integer
      const month = parseInt(parts[1], 10) - 1; // Convert the month part to an integer (months in JavaScript are 0-based)
      const year = parseInt(parts[2], 10); // Convert the year part to an integer
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

      const hours = Number(dateString.split(" ")[1].split(":")[0]);
      const minutes = dateString.split(" ")[1].split(":")[1];
      const ampm = hours >= 12 ? "PM" : "AM";
      const twelveHourFormat = hours % 12 || 12;

      const formattedDate = `${
        months[dateObject.getMonth()]
      } ${day}, ${year} ${twelveHourFormat}:${minutes
        .toString()
        .padStart(2, "0")} ${ampm}`;
      return formattedDate;
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
    index: number
  ) {
    const results: boolean[] = [];
    if (index === 1) {
      results.push(
        checkLengths(String(formValues.title), String(formValues.description))
          .error
      );
      results.push(checkValue("Title", 1).error);
      results.push(checkValue("Date", 1).error);
      results.push(checkValue("Description", 1).error);
    } else {
      results.push(
        checkLengths(String(formValues.title2), String(formValues.description2))
          .error
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
      let tasks;
      if (user?.projects[id].tasks) {
        tasks = [...user?.projects[id].tasks];
      }
      const yyyy: number | string = startDate.getFullYear();
      let mm: number | string = startDate.getMonth() + 1; // Months start at 0
      let dd: number | string = startDate.getDate();

      if (dd < 10) dd = "0" + dd;
      if (mm < 10) mm = "0" + mm;

      const hh: number | string = startDate.getHours();
      const mins: number | string = startDate.getMinutes();

      const formattedDate = `${dd}/${mm}/${yyyy} ${hh
        .toString()
        .padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

      const newTask: Task = {
        title: String(formValues.title),
        date: formattedDate,
        priority: String(
          String(String(formValues.priority)[0])
            .toUpperCase()
            .concat(String(formValues.priority.slice(1)))
        ),
        description: String(formValues.description),
        type: "to-do",
      };
      if (tasks) {
        tasks?.push(newTask);
      }
      const res = await fetch("/api/user", {
        method: "PATCH",
        body: JSON.stringify({ tasks: tasks, index: id }),
      });
      const data = await res.json();
      if (data.user != undefined && Object.keys(data.user).length !== 0) {
        const currentUser = JSON.parse(JSON.stringify(user));
        currentUser.projects[id].tasks = tasks;
        setUser(currentUser);
        hideModal(1);
      } else {
        if (data.message === "Date over max, set by project date") {
          errorToast("Date exceedes, the date set in project");
        } else {
          errorToast("An error occurred. Please try again.");
        }
      }
    }
  }

  async function startEditTask(index: number) {
    const taskBeingEdited = user?.projects[id].tasks[index];
    if (taskBeingEdited) {
      priorityInput2.current!.value =
        taskBeingEdited.priority.toLowerCase() || "";
      titleInput2.current!.value = taskBeingEdited.title || "";
      descriptionInput2.current!.value = taskBeingEdited.description || "";
      typeInput.current!.value = taskBeingEdited.type || "";
      const parts = taskBeingEdited.date.split(" "); // Split the date string into date and time parts
      const datePart = parts[0]; // Extract the date part "10/08/2023"
      const timePart = parts[1]; // Extract the time part "14:29"

      const dateParts = datePart.split("/"); // Split the date part into day, month, and year parts
      const day = parseInt(dateParts[0], 10); // Convert the day part to an integer
      const month = parseInt(dateParts[1], 10) - 1; // Convert the month part to an integer (months in JavaScript are 0-based)
      const year = parseInt(dateParts[2], 10); // Convert the year part to an integer

      const timeParts = timePart.split(":"); // Split the time part into hours and minutes
      const hours = parseInt(timeParts[0], 10); // Convert the hours part to an integer
      const minutes = parseInt(timeParts[1], 10); // Convert the minutes part to an integer

      const formattedDate = new Date(year, month, day, hours, minutes); // Create a new Date object with the components
      setStartDate2(formattedDate);

      editInput.current = index;
    }
    showModal(2);
  }

  async function deleteTask() {
    let tasks = user?.projects[id].tasks;
    tasks?.splice(editInput.current, 1);

    const res = await fetch("/api/user", {
      method: "PATCH",
      body: JSON.stringify({ tasks: tasks, index: id }),
    });
    const data = await res.json();
    if (data.user != undefined && Object.keys(data.user).length !== 0) {
      const currentUser = JSON.parse(JSON.stringify(user));
      currentUser.projects[id].tasks = tasks;
      setUser(currentUser);
      hideModal(2);
    } else {
      if (data.message === "Date over max, set by project date") {
        errorToast("Date exceedes, the date set in project");
      } else {
        errorToast("An error occurred. Please try again.");
      }
    }
  }

  async function handleDrop(drag: { id: number; userParam: User }, drop: any) {
    const tasks = drag.userParam.projects[id].tasks;
    const index = drag.id;
    if (tasks[index].type !== drop) {
      tasks[index].type = drop;
      await fetch("/api/user", {
        method: "PATCH",
        body: JSON.stringify({
          index: id,
          tasks: tasks,
        }),
      });
      const currentUser = JSON.parse(JSON.stringify(drag.userParam));
      currentUser.projects[id].tasks = tasks;
      setUser(currentUser);
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <>
        <div className={styles.searchContainer}>
          <input
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className={styles.search}
            placeholder="Search"
          />
        </div>
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
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat={
                  "MMMM d, yyyy " +
                  (user?.settings.timeFormat === 24 ? "HH:mm" : "h:mm aa")
                }
                selected={startDate}
                onChange={(date: Date) => setStartDate(date)}
                minDate={new Date()}
                maxDate={
                  typeof user?.projects[id].date === "string"
                    ? new Date(
                        Number(user?.projects[id].date.split("/")[2]),
                        Number(user?.projects[id].date.split("/")[1]) - 1,
                        Number(user?.projects[id].date.split("/")[0])
                      )
                    : null
                }
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
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat={
                  "MMMM d, yyyy " +
                  (user?.settings.timeFormat === 24 ? "HH:mm" : "h:mm aa")
                }
                maxDate={
                  typeof user?.projects[id].date === "string"
                    ? new Date(
                        Number(user?.projects[id].date.split("/")[2]),
                        Number(user?.projects[id].date.split("/")[1]) - 1,
                        Number(user?.projects[id].date.split("/")[0])
                      )
                    : null
                }
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
          <div className={styles.container}>
            <div className={styles.tasks}>
              <DropComponent type={"to-do"} onDrop={handleDrop}>
                <div className={styles.todo}>
                  <div className={styles.sectionText}>
                    To do
                    <div
                      className={styles.addUser}
                      onClick={() => showModal(1)}
                    >
                      Add
                    </div>
                  </div>
                  {user &&
                    user.projects[id].tasks?.filter(
                      (val) =>
                        val.type === "to-do" &&
                        (val.title
                          .toUpperCase()
                          .includes(searchField.toUpperCase()) ||
                          searchField === "")
                    ).length === 0 && <div>No tasks</div>}
                  {user &&
                    user.projects[id].tasks.map(
                      (task, index) =>
                        task.type === "to-do" &&
                        task.priority === "High" &&
                        (task.title
                          .toUpperCase()
                          .includes(searchField.toUpperCase()) ||
                          searchField === "") && (
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
                        )
                    )}
                  {user &&
                    user.projects[id].tasks.map(
                      (task, index) =>
                        task.type === "to-do" &&
                        task.priority === "Medium" &&
                        (task.title
                          .toUpperCase()
                          .includes(searchField.toUpperCase()) ||
                          searchField === "") && (
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
                        )
                    )}
                  {user &&
                    user.projects[id].tasks.map(
                      (task, index) =>
                        task.type === "to-do" &&
                        task.priority === "Low" &&
                        (task.title
                          .toUpperCase()
                          .includes(searchField.toUpperCase()) ||
                          searchField === "") && (
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
                        )
                    )}
                </div>
              </DropComponent>

              <DropComponent type={"in-progress"} onDrop={handleDrop}>
                <div className={styles.ongoing}>
                  <div className={styles.sectionText}>In progress</div>
                  {user &&
                    user.projects[id].tasks?.filter(
                      (val) =>
                        val.type === "in-progress" &&
                        (val.title
                          .toUpperCase()
                          .includes(searchField.toUpperCase()) ||
                          searchField === "")
                    ).length === 0 && <div>No tasks</div>}
                  {user &&
                    user.projects[id].tasks.map(
                      (task, index) =>
                        task.type === "in-progress" &&
                        task.priority === "High" &&
                        (task.title
                          .toUpperCase()
                          .includes(searchField.toUpperCase()) ||
                          searchField === "") && (
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
                        )
                    )}
                  {user &&
                    user.projects[id].tasks.map(
                      (task, index) =>
                        task.type === "in-progress" &&
                        task.priority === "Medium" &&
                        (task.title
                          .toUpperCase()
                          .includes(searchField.toUpperCase()) ||
                          searchField === "") && (
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
                        )
                    )}
                  {user &&
                    user.projects[id].tasks.map(
                      (task, index) =>
                        task.type === "in-progress" &&
                        task.priority === "Low" &&
                        (task.title
                          .toUpperCase()
                          .includes(searchField.toUpperCase()) ||
                          searchField === "") && (
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
                        )
                    )}
                </div>
              </DropComponent>
              <DropComponent type={"done"} onDrop={handleDrop}>
                <div className={styles.done}>
                  <div className={styles.sectionText}>Done</div>
                  {user &&
                    user.projects[id].tasks?.filter(
                      (val) =>
                        val.type === "done" &&
                        (val.title
                          .toUpperCase()
                          .includes(searchField.toUpperCase()) ||
                          searchField === "")
                    ).length === 0 && <div>No tasks</div>}
                  {user &&
                    user.projects[id].tasks.map(
                      (task, index) =>
                        task.type === "done" &&
                        task.priority === "High" &&
                        (task.title
                          .toUpperCase()
                          .includes(searchField.toUpperCase()) ||
                          searchField === "") && (
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
                        )
                    )}
                  {user &&
                    user.projects[id].tasks.map(
                      (task, index) =>
                        task.type === "done" &&
                        task.priority === "Medium" &&
                        (task.title
                          .toUpperCase()
                          .includes(searchField.toUpperCase()) ||
                          searchField === "") && (
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
                        )
                    )}
                  {user &&
                    user.projects[id].tasks.map(
                      (task, index) =>
                        task.type === "done" &&
                        task.priority === "Low" &&
                        (task.title
                          .toUpperCase()
                          .includes(searchField.toUpperCase()) ||
                          searchField === "") && (
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
                        )
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
