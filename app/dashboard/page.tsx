"use client";

import React, { useEffect, useState } from "react";
import styles from "@/styles/dashboard.module.css";
import { Metadata } from "next";

type Task = {
  title: String;
  date: String;
  description: String;
  type: String;
  priority: String;
};

type User = {
  password: String;
  tasks: Task[];
  email: String;
  name: String;
};

async function getData() {
  const res = await fetch("/api/user", { next: { revalidate: 10 } });
  return res.json();
}

const page = () => {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    getData().then((val) => setUser(val.user));
  }, []);

  return (
    <div className={styles.page}>
      <title>Dashboard</title>
      <div className={styles.container}>
        <div className={styles.tasks}>
          <div className={styles.todo}>
            <div className={styles.sectionText}>To do</div>
            {user &&
              user.tasks?.map(
                (task) =>
                  task.type === "to-do" && (
                    <div className={styles.task}>
                      <p className={styles.taskTitle}>{task.title}</p>
                      <p
                        id={
                          task.priority === "Low"
                            ? styles.low
                            : task.priority === "Medium"
                            ? styles.medium
                            : (task.priority === "High" && styles.high) || ""
                        }
                        className={styles.priority}
                      >
                        {task.priority}
                      </p>
                    </div>
                  )
              )}
          </div>
          <div className={styles.ongoing}>
            <div className={styles.sectionText}>Ongoing</div>
            {user &&
              user.tasks?.map(
                (task) =>
                  task.type === "ongoing" && (
                    <div className={styles.task}>
                      <p className={styles.taskTitle}>{task.title}</p>
                      <p
                        id={
                          task.priority === "Low"
                            ? styles.low
                            : task.priority === "Medium"
                            ? styles.medium
                            : (task.priority === "High" && styles.high) || ""
                        }
                        className={styles.priority}
                      >
                        {task.priority}
                      </p>
                    </div>
                  )
              )}
          </div>
          <div className={styles.done}>
            <div className={styles.sectionText}>Done</div>
            {user &&
              user.tasks?.map(
                (task) =>
                  task.type === "done" && (
                    <div className={styles.task}>
                      <p className={styles.taskTitle}>{task.title}</p>
                      <p
                        id={
                          task.priority === "Low"
                            ? styles.low
                            : task.priority === "Medium"
                            ? styles.medium
                            : (task.priority === "High" && styles.high) || ""
                        }
                        className={styles.priority}
                      >
                        {task.priority}
                      </p>
                    </div>
                  )
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
