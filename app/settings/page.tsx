"use client";

import ProfileSettings from "@/components/ProfileSettings";
import TaskSettings from "@/components/TaskSettings";
import styles from "@/styles/settings.module.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const back = useSearchParams().get("back");
  const [user, setUser] = useState<any>();
  const dialog = useRef<HTMLDialogElement>(null);
  const [settingsSection, setSettingsSection] = useState<
    "profile" | "app" | "everything"
  >("profile");

  useEffect(() => {
    async function getData() {
      if (window.innerHeight > window.innerWidth) {
        setSettingsSection("everything");
      }
      const res = await fetch("/api/user");
      const data = await res.json();
      setUser(data.user);
    }
    getData();
  }, []);

  if (window != undefined) {
    window.onbeforeunload = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    };
  }

  useEffect(() => {
    if (window != undefined) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }
  }, [settingsSection]);

  return (
    <div className={styles.page}>
      <dialog ref={dialog} className={styles.dialog}>
        <div>
          <p>Are you sure?</p>
        </div>
        <div className={styles.bottomButton}>
          <button className={styles.back}>No</button>
          <button className={styles.delete}>Yes</button>
        </div>
      </dialog>
      <title>Settings</title>

      <ul className={styles.sideNav}>
        <li
          onClick={() =>
            settingsSection !== "everything" && setSettingsSection("profile")
          }
        >
          Account
        </li>
        <li
          onClick={() =>
            settingsSection !== "everything" && setSettingsSection("app")
          }
        >
          App settings
        </li>
        <li>Something</li>
        <li>Something</li>
        <li>Something</li>
        <li>Something</li>
        <li>Something</li>
        <li>Something</li>
        <Link href={back ? String(back) : "/projects"}>Back</Link>
      </ul>

      <div className={styles.container}>
        {user ? (
          <>
            {(settingsSection === "profile" ||
              settingsSection === "everything") && (
              <ProfileSettings back={back} user={user} dialog={dialog} />
            )}
            {settingsSection === "app" ||
              (settingsSection === "everything" && (
                <TaskSettings user={user} />
              ))}
          </>
        ) : (
          <p style={{ fontSize: "20px" }}>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Page;
