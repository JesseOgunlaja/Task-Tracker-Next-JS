"use client";

import styles from "@/styles/taskSettings.module.css";
import { errorToast, successToast } from "@/utils/toast";
import { FormEvent, useState } from "react";

const TaskSettings = ({ user: userProp }: {user: {settings: {timeFormat: number, calendars: [string]}}}) => {
  const [user,setUser] = useState(userProp)
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    const timeFormat = formValues.timeFormat;

    const res = await fetch("/api/settingsChange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeFormat: Number(timeFormat),
      }),
    });
    const data = await res.json();
    if (data.message === "Success") {
      successToast("Success");
    }
    if (data.message === "Same") {
      errorToast("Value has not changed");
    }
  }

  function addNewSection() {
    const currentUser = JSON.parse(JSON.stringify(user))
    currentUser.settings.calendars.push("")
    setUser(currentUser)
  }

  async function changeCalendar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    const amountOfEmptyStrings = user.settings.calendars.filter(val => val === "").length

    if(amountOfEmptyStrings === 0) {
      const res = await fetch("/api/settingsChange", {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          calendars: user.settings.calendars
        })
      })
      const data = await res.json()
      if(data.message === "Same") {
        errorToast("Same calendars")
      }
      if(data.message === "Success") {
        successToast("Success")
      }
    }
    else {
      errorToast("Calendars can't be empty strings")
    }
  }

  function handleChange(index: number,value: string) {
    const currentUser = JSON.parse(JSON.stringify(user))
   currentUser.settings.calendars[index] = value
   setUser(currentUser)
  }

  return (
    <div className={styles.container}>
      <h1>App settings</h1>
      <br />
      <p>Time format</p>
      <form onSubmit={submit} className={styles.form}>
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
      
    </div>
  );
};

export default TaskSettings;
