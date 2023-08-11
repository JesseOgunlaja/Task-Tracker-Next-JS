"use client"

import styles from "@/styles/taskSettings.module.css";
import { errorToast, successToast } from "@/utils/toast";
import { FormEvent } from "react";

const TaskSettings = ({ user }: any) => {
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

  return (
    <div className={styles.container}>
        <h1>App settings</h1>
      <form onSubmit={submit} className={styles.form}>
        <label htmlFor="timeFormat">Time format</label>
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
