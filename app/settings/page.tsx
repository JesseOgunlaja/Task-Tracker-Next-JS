"use client";

import ProfileSettings from "@/components/ProfileSettings";
import TaskSettings from "@/components/TaskSettings";
import styles from "@/styles/settings.module.css";
import Link from "next/link";
import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import GetUser from "@/hooks/GetUser";

const Page = () => {
  const searchParams = useSearchParams();
  const back = searchParams.get("back");
  const paramsSection = searchParams.get("section");
  const section: "profile" | "app" | "everything" =
    window.innerHeight > window.innerWidth
      ? "everything"
      : paramsSection === "profile" ||
        paramsSection === "everything" ||
        paramsSection === "app"
      ? paramsSection
      : "profile";
  const [user, setUser] = GetUser();
  const dialog = useRef<HTMLDialogElement>(null);

  if (window != undefined) {
    window.onbeforeunload = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    };
  }

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
        <li>
          <Link href={`/settings?section=profile&back=${back || "/projects"}`}>
            Account
          </Link>
        </li>
        <li>
          <Link href={`/settings?section=app&back=${back || "/projects"}`}>
            App settings
          </Link>
        </li>
        <li className={styles.something}>Something</li>
        <li className={styles.something}>Something</li>
        <li className={styles.something}>Something</li>
        <li className={styles.something}>Something</li>
        <li className={styles.something}>Something</li>
        <li className={styles.something}>Something</li>
        <Link href={back ? String(back) : "/projects"}>Back</Link>
      </ul>

      <div className={styles.container}>
        {user ? (
          <>
            {(section === "profile" || section === "everything") && (
              <ProfileSettings back={back} user={user} dialog={dialog} />
            )}
            {(section === "app" || section === "everything") && (
              <TaskSettings user={user} />
            )}
          </>
        ) : (
          <p style={{ fontSize: "20px" }}>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Page;
