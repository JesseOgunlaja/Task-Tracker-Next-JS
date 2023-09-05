"use client";

import styles from "@/styles/taskSettings.module.css";
import { errorToast, successToast } from "@/utils/toast";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";

const TaskSettings = ({
  user: userProp,
}: {
  user: {
    projects: [any];
    settings: { timeFormat: number; calendars: [string]; dateFormat: string };
  };
}) => {
  const [user, setUser] = useState(userProp);

  async function changeTimeFormat(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    const timeFormat = formValues.timeFormat;

    let data: any;
    const fetchRequest = new Promise((resolve, reject) => {
      fetch("/api/settingsChange", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeFormat: Number(timeFormat),
        }),
      }).then(async (response: Response) => {
        data = await response.json();
        if (data.message === "Success") {
          resolve(data);
        } else {
          reject(data);
        }
      });
    });
    await toast.promise(fetchRequest, {
      pending: "Loading",
      success: "Success",
      error: {
        render() {
          if (data.message === "Same") {
            return "Time format has not changed";
          } else {
            return "An error occurred. Please try again";
          }
        },
      },
    });
  }

  function addNewSection() {
    const currentUser = JSON.parse(JSON.stringify(user));
    currentUser.settings.calendars.push("");
    setUser(currentUser);
  }

  async function changeCalendar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const amountOfEmptyStrings = user.settings.calendars.filter(
      (val) => val === "",
    ).length;

    if (amountOfEmptyStrings === 0) {
      let data: any;
      const fetchRequest = new Promise((resolve, reject) => {
        fetch("/api/settingsChange", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            calendars: user.settings.calendars,
          }),
        }).then(async (response: Response) => {
          data = await response.json();
          if (data.message === "Success") {
            resolve(data);
          } else {
            reject(data);
          }
        });
      });
      await toast.promise(fetchRequest, {
        pending: "Loading",
        success: "Success",
        error: {
          render() {
            if (data.message === "Same") {
              return "Calendars have not changed";
            } else {
              return "An error occurred. Please try again";
            }
          },
        },
      });
    } else {
      errorToast("Calendars can't be empty strings");
    }
  }

  function handleChange(index: number, value: string) {
    const currentUser = JSON.parse(JSON.stringify(user));
    currentUser.settings.calendars[index] = value;
    setUser(currentUser);
  }

  function handleDelete(index: number) {
    if (
      user.projects.every((val) => val.type !== user.settings.calendars[index])
    ) {
      const currentUser = JSON.parse(JSON.stringify(user));
      currentUser.settings.calendars.splice(index, 1);
      setUser(currentUser);
    } else {
      errorToast(
        `Remove all projects with "${user.settings.calendars[index]}" tag before removing it`,
        5000,
      );
    }
  }
  async function changeDateFormat(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    const dateFormat = formValues.dateFormat;

    let data: any;
    const fetchRequest = new Promise((resolve, reject) => {
      fetch("/api/settingsChange", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateFormat,
        }),
      }).then(async (response: Response) => {
        data = await response.json();
        if (data.message === "Success") {
          resolve(data);
        } else {
          reject(data);
        }
      });
    });
    await toast.promise(fetchRequest, {
      pending: "Loading",
      success: "Success",
      error: {
        render() {
          if (data.message === "Same") {
            return "Date format the same as before";
          } else {
            return "An error occurred. Please try again";
          }
        },
      },
    });
  }

  return (
    <div className={styles.container}>
      <h1>App settings</h1>
      <br />
      <p>Time format</p>
      <form onSubmit={changeTimeFormat} className={styles.form}>
        <select
          defaultValue={user.settings.timeFormat}
          name="timeFormat"
          id="timeFormat"
        >
          <option value="12">12</option>
          <option value="24">24</option>
        </select>
        <input type="submit" />
      </form>
      <p>Time format</p>
      <form onSubmit={changeDateFormat} className={styles.form}>
        <select
          name="dateFormat"
          id="dateFormat"
          defaultValue={user.settings.dateFormat}
        >
          <option value="dd/MM/yyyy">DD/MM/YYYY</option>
          <option value="MM/dd/yyyy">MM/DD/YYYY</option>
          <option value="yyyy-MM-dd">YYYY-MM-DD</option>
        </select>
        <input type="submit" />
      </form>
      <p>Calendars</p>
      <form onSubmit={changeCalendar} className={styles.calendarsForm}>
        {user.settings.calendars.map((val, index: number) => (
          <>
            <input
              key={index}
              value={val}
              onChange={(e) => handleChange(index, e.target.value)}
            />
            <i
              onClick={() => handleDelete(index)}
              className="fa fa-trash"
              aria-hidden="true"
            ></i>
          </>
        ))}
        <button type="button" onClick={addNewSection}>
          Add new section
        </button>
        <br />
        <input type="submit" />
      </form>
    </div>
  );
};

export default TaskSettings;
