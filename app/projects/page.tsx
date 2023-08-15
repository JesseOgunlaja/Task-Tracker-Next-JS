"use client";

import styles from "@/styles/projects.module.css";
import Slider from "@/components/Slider";
import Link from "next/link";
import DatePicker from "react-datepicker";
import {
  CSSProperties,
  FormEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { z } from "zod";
import { errorToast } from "@/utils/toast";
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
  date: string;
  type: string;
  section: string;
  priority: string;
  tasks: Task[];
};

type User = {
  projects: Project[];
};

const titleSchema = z.string().max(40, { message: "Title too long" });

const Page = () => {
  const [user, setUser] = useState<User>();
  const [startDate, setStartDate] = useState(new Date());
  const [startDate2, setStartDate2] = useState(new Date());
  const [searchField, setSearchField] = useState<string>("");
  const dialog = useRef<HTMLDialogElement>(null);
  const dialog2 = useRef<HTMLDialogElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const titleInput2 = useRef<HTMLInputElement>(null);
  const priorityInput = useRef<HTMLSelectElement>(null);
  const priorityInput2 = useRef<HTMLSelectElement>(null);
  const typeInput = useRef<HTMLSelectElement>(null);
  const editInput = useRef<number>(0);

  useEffect(() => {
    async function getData() {
      const res = await fetch(`/api/user`);
      const data = await res.json();
      setUser(data.user);
    }
    getData();
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

  function checkLengths(title: string, description: string) {
    const titleResult = titleSchema.safeParse(title);

    if (!titleResult.success) {
      errorToast(titleResult.error.format()._errors[0]);
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
    } else {
      results.push(
        checkLengths(String(formValues.title2), String(formValues.description2))
          .error
      );
      results.push(checkValue("Title", 2).error);
      results.push(checkValue("Date", 2).error);
    }
    const result = !results.every((val) => val === false);
    return { error: result };
  }

  async function addProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    if (!checkAllValues(formValues, 1).error) {
      const yyyy: number | string = startDate.getFullYear();
      let mm: number | string = startDate.getMonth() + 1; // Months start at 0
      let dd: number | string = startDate.getDate();

      if (dd < 10) dd = "0" + dd;
      if (mm < 10) mm = "0" + mm;

      const formattedDate = `${dd}/${mm}/${yyyy}`;

      const newProject = {
        type: String(formValues.section),
        date: formattedDate,
        name: String(formValues.title),
        priority: String(formValues.priority),
        section: "to-do",
        tasks: [],
      };

      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          newProject: newProject,
        }),
      });
      const data = await res.json();
      console.log(data);
      if (data.user) {
        const currentUser = JSON.parse(JSON.stringify(user));
        currentUser.projects = data.user.projects;
        setUser(currentUser);
        hideModal(1);
      } else {
        errorToast("An error occurred. Please try again.");
      }
    }
  }

  async function startEditProject(index: number, e: MouseEvent<HTMLElement>) {
    e.preventDefault();
    const taskBeingEdited = user?.projects[index];
    if (taskBeingEdited) {
      priorityInput2.current!.value = taskBeingEdited.priority;
      titleInput2.current!.value = taskBeingEdited.name;
      typeInput.current!.value = taskBeingEdited.type;

      const parts = taskBeingEdited.date.split("/"); // Split the date string into date and time parts

      const day = parseInt(parts[0], 10); // Convert the day part to an integer
      const month = parseInt(parts[1], 10) - 1; // Convert the month part to an integer (months in JavaScript are 0-based)
      const year = parseInt(parts[2], 10); // Convert the year part to an integer

      const formattedDate = new Date(year, month, day); // Create a new Date object with the components
      setStartDate2(formattedDate);
      showModal(2);

      editInput.current = index;
    }
  }

  async function editProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    if (checkAllValues(formValues, 2).error === false) {
      const yyyy: number | string = startDate2.getFullYear();
      let mm: number | string = startDate2.getMonth() + 1; // Months start at 0
      let dd: number | string = startDate2.getDate();

      const formattedDate = `${dd}/${mm}/${yyyy}`;

      const editedProject = {
        name: String(formValues.title2),
        date: formattedDate,
        priority: String(
          String(String(formValues.priority2)[0])
            .toUpperCase()
            .concat(String(formValues.priority2.slice(1)))
        ),
        section: user?.projects[editInput.current].section,
        type: String(formValues.section),
        tasks: user?.projects[editInput.current].tasks,
      };

      console.log(editedProject);

      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          editedProject: editedProject,
          editIndex: editInput.current,
        }),
      });
      const data = await res.json();
      if (data.user != undefined || Object.keys(data.user).length !== 0) {
        const currentUser = JSON.parse(JSON.stringify(user));
        currentUser.projects[editInput.current] =
          data.user[`projects.${editInput.current}`];
        setUser(currentUser);
        hideModal(2);
      } else {
        errorToast("An error occurred. Please try again.");
      }
    }
  }

  async function deleteProject() {
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        indexToDelete: editInput.current,
      }),
    });
    const data = await res.json();
    if (data.user != undefined && Object.keys(data.user).length !== 0) {
      const currentUser = JSON.parse(JSON.stringify(user));
      currentUser.projects[editInput.current] = data.user[`projects`];
      setUser(currentUser);
      hideModal(2);
    } else {
      errorToast("An error occurred. Please try again.");
    }
  }

  const faIconStyles: CSSProperties = {
    fontSize: "23px",
    transform: "translateY(-3px)",
  };

  return (
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
        <script
          async
          src="https://kit.fontawesome.com/b9c7cb7078.js"
          crossOrigin="anonymous"
        ></script>
        <dialog className={styles.dialog} ref={dialog}>
          <form onSubmit={addProject} className={styles.form}>
            {user == null ? (
              <p style={{ fontSize: "20px", color: "white" }}>Loading...</p>
            ) : (
              <>
                <label htmlFor="title">Title</label>
                <input
                  autoComplete="off"
                  ref={titleInput}
                  name="title"
                  id="title"
                  type="text"
                  placeholder="Work project"
                />
                <label htmlFor="date">Date</label>
                <DatePicker
                  autoComplete="off"
                  dateFormat="MMMM d, yyyy"
                  selected={startDate}
                  onChange={(date: Date) => setStartDate(date)}
                  minDate={new Date()}
                  placeholderText="Select a date"
                  className={styles.date}
                  id="date"
                />
                <label htmlFor="section">Section</label>
                <select name="section" id="section">
                  {user?.projects.map((project, index) => {
                    const isFirstOfType =
                      user?.projects.findIndex(
                        (p) => p.type === project.type
                      ) === index;
                    if (isFirstOfType) {
                      return (
                        <option key={index} value={project.type}>
                          {project.type}
                        </option>
                      );
                    }
                    return null;
                  })}
                </select>
                <button type="button" value="AddProject">
                  Add section
                </button>
                <label htmlFor="priority">Priority</label>
                <select name="priority" ref={priorityInput} id="priority">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <input type="submit" />
              </>
            )}
          </form>
          <button onClick={() => hideModal(1)} className={styles.backButton}>
            Back
          </button>
        </dialog>

        <dialog className={styles.dialog} ref={dialog2}>
          <form onSubmit={editProject} className={styles.form}>
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
              dateFormat="MMMM d, yyyy"
              selected={startDate2}
              onChange={(date: Date) => setStartDate2(date)}
              minDate={new Date()}
              placeholderText="Select a date"
              className={styles.date}
              id="date2"
            />
            <label htmlFor="section">Section</label>
            <select
              ref={typeInput}
              defaultValue={user?.projects[editInput.current].type}
              name="section"
              id="section"
            >
              {user?.projects.map((project, index) => {
                const isFirstOfType =
                  user?.projects.findIndex((p) => p.type === project.type) ===
                  index;
                if (isFirstOfType) {
                  return (
                    <option key={index} value={project.type}>
                      {project.type}
                    </option>
                  );
                }
                return null;
              })}
            </select>
            <label htmlFor="priority2">Priority</label>
            <select name="priority2" ref={priorityInput2} id="priority2">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <input type="submit" />
          </form>
          <div className={styles.bottomButton}>
            <button className={styles.back} onClick={() => hideModal(2)}>
              Back
            </button>
            <button className={styles.delete} onClick={deleteProject}>
              Delete
            </button>
          </div>
        </dialog>
        <div className={styles.container}>
          <div className={styles.projects}>
            <div className={styles.section}>
              <div className={styles.sectionText}>
                To do
                <div className={styles.addProject} onClick={() => showModal(1)}>
                  Add
                </div>
              </div>
              {user == null ? (
                <p style={{ fontSize: "20px" }}>Loading ...</p>
              ) : (
                <>
                  {user.projects.filter(
                    (project) => project.section === "to-do"
                  ).length === 0 && <p>No projects</p>}
                </>
              )}
              {user?.projects.map(
                (project, index: number) =>
                  project.section === "to-do" &&
                  (project.name
                    .toUpperCase()
                    .includes(searchField.toUpperCase()) ||
                    searchField === "") && (
                    <Link
                      passHref={false}
                      href={`/projects/${index}`}
                      className={styles.project}
                      key={index}
                    >
                      <div className={styles.taskTitle}>
                        <div className={styles.taskName}>
                          <p>{project.name}</p>{" "}
                          <i
                            onClick={(event) => startEditProject(index, event)}
                            className="far fa-edit"
                            style={faIconStyles}
                          ></i>
                        </div>{" "}
                        <div>
                          <p className={styles.textDate}>{project.date}</p>
                        </div>
                      </div>
                      <div className={styles.footer}>
                        <p className={styles.type}>{project.type}</p>
                        <p>
                          {
                            project.tasks.filter((task) => task.type === "done")
                              .length
                          }
                          &#47;
                          {project.tasks.length +
                            " completed " +
                            "(" +
                            Math.round(
                              project.tasks.length === 0
                                ? 0
                                : (project.tasks.filter(
                                    (task) => task.type === "done"
                                  ).length /
                                    project.tasks.length) *
                                    100
                            ) +
                            "%" +
                            ")"}
                        </p>
                        <Slider
                          completedTasks={
                            project.tasks.filter((task) => task.type === "done")
                              .length
                          }
                          totalTasks={project.tasks.length}
                        />
                      </div>
                      <div
                        id={
                          project.priority === "High"
                            ? styles.high
                            : project.priority === "Medium"
                            ? styles.medium
                            : styles.low
                        }
                        className={styles.priority}
                      >
                        {project.priority}
                      </div>
                    </Link>
                  )
              )}
            </div>
            <div className={styles.section}>
              <div className={styles.sectionText}>In progress</div>
              {user == null ? (
                <p style={{ fontSize: "20px" }}>Loading ...</p>
              ) : (
                <>
                  {user.projects.filter(
                    (project) => project.section === "in-progress"
                  ).length === 0 && <p>No projects</p>}
                </>
              )}
              {user?.projects.map(
                (project, index: number) =>
                  project.section === "in-progress" &&
                  (project.name
                    .toUpperCase()
                    .includes(searchField.toUpperCase()) ||
                    searchField === "") && (
                    <Link
                      href={`/projects/${index}`}
                      className={styles.project}
                      key={index}
                    >
                      <div className={styles.taskTitle}>
                        <div className={styles.taskName}>
                          <p>{project.name}</p>{" "}
                          <i
                            onClick={(event) => startEditProject(index, event)}
                            className="far fa-edit"
                            style={faIconStyles}
                          ></i>
                        </div>{" "}
                        <div>
                          <p className={styles.textDate}>{project.date}</p>
                        </div>
                      </div>
                      <div className={styles.footer}>
                        <p className={styles.type}>{project.type}</p>
                        <p>
                          {
                            project.tasks.filter((task) => task.type === "done")
                              .length
                          }
                          &#47;
                          {project.tasks.length +
                            " completed " +
                            "(" +
                            Math.round(
                              project.tasks.length === 0
                                ? 0
                                : (project.tasks.filter(
                                    (task) => task.type === "done"
                                  ).length /
                                    project.tasks.length) *
                                    100
                            ) +
                            "%" +
                            ")"}
                        </p>
                        <Slider
                          completedTasks={
                            project.tasks.filter((task) => task.type === "done")
                              .length
                          }
                          totalTasks={project.tasks.length}
                        />
                      </div>
                      <div
                        id={
                          project.priority === "High"
                            ? styles.high
                            : project.priority === "Medium"
                            ? styles.medium
                            : styles.low
                        }
                        className={styles.priority}
                      >
                        {project.priority}
                      </div>
                    </Link>
                  )
              )}
            </div>
            <div className={styles.section}>
              <div className={styles.sectionText}>Done</div>
              {user == null ? (
                <p style={{ fontSize: "20px" }}>Loading ...</p>
              ) : (
                <>
                  {user.projects.filter((project) => project.section === "done")
                    .length === 0 && <p>No projects</p>}
                </>
              )}
              {user?.projects.map(
                (project, index: number) =>
                  project.section === "done" &&
                  (project.name
                    .toUpperCase()
                    .includes(searchField.toUpperCase()) ||
                    searchField === "") && (
                    <Link
                      href={`/projects/${index}`}
                      className={styles.project}
                      key={index}
                    >
                      <div className={styles.taskTitle}>
                        <div className={styles.taskName}>
                          <p>{project.name}</p>{" "}
                          <i
                            onClick={(event) => startEditProject(index, event)}
                            className="far fa-edit"
                            style={faIconStyles}
                          ></i>
                        </div>{" "}
                        <div>
                          <p className={styles.textDate}>{project.date}</p>
                        </div>
                      </div>
                      <div className={styles.footer}>
                        <p className={styles.type}>{project.type}</p>
                        <p>
                          {
                            project.tasks.filter((task) => task.type === "done")
                              .length
                          }
                          &#47;
                          {project.tasks.length +
                            " completed " +
                            "(" +
                            Math.round(
                              project.tasks.length === 0
                                ? 0
                                : (project.tasks.filter(
                                    (task) => task.type === "done"
                                  ).length /
                                    project.tasks.length) *
                                    100
                            ) +
                            "%" +
                            ")"}
                        </p>
                        <Slider
                          completedTasks={
                            project.tasks.filter((task) => task.type === "done")
                              .length
                          }
                          totalTasks={project.tasks.length}
                        />
                      </div>
                      <div
                        id={
                          project.priority === "High"
                            ? styles.high
                            : project.priority === "Medium"
                            ? styles.medium
                            : styles.low
                        }
                        className={styles.priority}
                      >
                        {project.priority}
                      </div>
                    </Link>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
