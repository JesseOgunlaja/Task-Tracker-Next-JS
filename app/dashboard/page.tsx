"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import styles from "@/styles/dashboard.module.css";
import OverallNav from "@/components/OverallNav";
import { errorToast } from "@/utils/toast";

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

async function getData() {
  const res = await fetch("/api/user");
  return res.json();
}

const page = () => {
  const [user, setUser] = useState<User>();
  const dialog = useRef<HTMLDialogElement>(null);
  const dialog2 = useRef<HTMLDialogElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const titleInput2 = useRef<HTMLInputElement>(null);
  const descriptionInput = useRef<HTMLTextAreaElement>(null);
  const descriptionInput2 = useRef<HTMLTextAreaElement>(null);
  const dateInput = useRef<HTMLInputElement>(null);
  const dateInput2 = useRef<HTMLInputElement>(null);
  const priorityInput = useRef<HTMLSelectElement>(null);
  const priorityInput2 = useRef<HTMLSelectElement>(null);
  const typeInput = useRef<HTMLSelectElement>(null);
  const editInput = useRef<number>(0);

  if(window != undefined) {

    window.onkeydown = async () => {
      console.log("hi")
      await fetch("/api/revalidatePath")
    }
  }

  useEffect(() => {
    getData().then((val) => setUser(val.user));
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
    dateInput.current!.value = "";
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
        value = dateInput.current?.value;
      } else {
        value = descriptionInput.current?.value;
      }
    } else {
      if (valueChecking === "Title") {
        value = titleInput2.current?.value;
      } else if (valueChecking === "Date") {
        value = dateInput2.current?.value;
      } else {
        value = descriptionInput2.current?.value;
      }
    }

    if (
      value === "" ||
      value == null ||
      value == undefined ||
      typeof value !== "string"
    ) {
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
    if (
      checkValue("Title", 2).error === false &&
      checkValue("Date", 2).error === false &&
      checkValue("Description", 2).error === false
    ) {
      const tasks = user?.tasks;
      if (tasks) {
        tasks[editInput.current] = {
          title: String(formValues.title2),
          date: String(formValues.date2),
          description: String(formValues.description2),
          priority: String(
            String(String(formValues.priority2)[0])
              .toUpperCase()
              .concat(String(formValues.priority2.slice(1)))
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

  async function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    if (
      checkValue("Title", 1).error === false &&
      checkValue("Date", 1).error === false &&
      checkValue("Description", 1).error === false
    ) {
      const tasks = user?.tasks;
      tasks?.push({
        title: String(formValues.title),
        date: String(formValues.date),
        priority: String(
          String(String(formValues.priority)[0])
            .toUpperCase()
            .concat(String(formValues.priority.slice(1)))
        ),
        description: String(formValues.description),
        type: "to-do",
      });
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

  function startEditTask(index: number) {
    priorityInput2.current!.value =
      user?.tasks[index].priority.toLowerCase() || "";
    titleInput2.current!.value = user?.tasks[index].title || "";
    descriptionInput2.current!.value = user?.tasks[index].description || "";
    typeInput.current!.value = user?.tasks[index].type || "";
    dateInput2.current!.value = user?.tasks[index].date || "";
    editInput.current = index;
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
    hideModal(2)
  }

  return (
    <>
      <OverallNav />
      <div className={styles.page}>
        <dialog className={styles.dialog} ref={dialog}>
          <form onSubmit={addTask} className={styles.form}>
            <label htmlFor="title">Title</label>
            <input
              ref={titleInput}
              name="title"
              id="title"
              type="text"
              placeholder="Work meeting"
            />
            <label htmlFor="date">Date</label>
            <input
              ref={dateInput}
              name="date"
              id="date"
              type="text"
              placeholder="Tomorrow at 14:30"
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
              ref={titleInput2}
              name="title2"
              id="title2"
              type="text"
              placeholder="Work meeting"
            />
            <label htmlFor="date2">Date</label>
            <input
              ref={dateInput2}
              name="date2"
              id="date2"
              type="text"
              placeholder="Tomorrow at 14:30"
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
            <div className={styles.todo}>
              <div onClick={() => showModal(1)} className={styles.sectionText}>
                To do<div className={styles.addUser}>Add</div>
              </div>
              {user &&
                user.tasks?.filter((val) => val.type === "to-do").length ===
                  0 && <div>No tasks</div>}
              {user &&
                user.tasks?.map(
                  (task, index) =>
                    task.type === "to-do" && (
                      <div key={index}
                        onClick={() => startEditTask(index)}
                        className={styles.task}
                      >
                        <p className={styles.taskTitle}>{task.title}</p>
                        <div className={styles.info}>
                          <p>{task.date}</p>
                          <p
                            id={
                              task.priority === "Low"
                                ? styles.low
                                : task.priority === "Medium"
                                ? styles.medium
                                : (task.priority === "High" && styles.high) ||
                                  ""
                            }
                            className={styles.priority}
                          >
                            {task.priority}
                          </p>
                        </div>
                      </div>
                    )
                )}
            </div>
            <div className={styles.ongoing}>
              <div className={styles.sectionText}>In progress</div>
              {user &&
                user.tasks?.filter((val) => val.type === "in-progress")
                  .length === 0 && <div>No tasks</div>}
              {user &&
                user.tasks?.map(
                  (task, index) =>
                    task.type === "in-progress" && (
                      <div key={index}
                        onClick={() => startEditTask(index)}
                        className={styles.task}
                      >
                        <p className={styles.taskTitle}>{task.title}</p>
                        <div className={styles.info}>
                          <p>{task.date}</p>
                          <p
                            id={
                              task.priority === "Low"
                                ? styles.low
                                : task.priority === "Medium"
                                ? styles.medium
                                : (task.priority === "High" && styles.high) ||
                                  ""
                            }
                            className={styles.priority}
                          >
                            {task.priority}
                          </p>
                        </div>
                      </div>
                    )
                )}
            </div>
            <div className={styles.done}>
              <div className={styles.sectionText}>Done</div>
              {user &&
                user.tasks?.filter((val) => val.type === "done").length ===
                  0 && <div>No tasks</div>}
              {user &&
                user.tasks?.map(
                  (task, index) =>
                    task.type === "done" && (
                      <div key={index}
                        onClick={() => startEditTask(index)}
                        className={styles.task}
                      >
                        <p className={styles.taskTitle}>{task.title}</p>
                        <div className={styles.info}>
                          <p>{task.date}</p>
                          <p
                            id={
                              task.priority === "Low"
                                ? styles.low
                                : task.priority === "Medium"
                                ? styles.medium
                                : (task.priority === "High" && styles.high) ||
                                  ""
                            }
                            className={styles.priority}
                          >
                            {task.priority}
                          </p>
                        </div>
                      </div>
                    )
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
