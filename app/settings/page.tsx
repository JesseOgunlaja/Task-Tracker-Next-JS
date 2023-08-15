"use client";

import ProfileSettings from "@/components/ProfileSettings";
import TaskSettings from "@/components/TaskSettings";
import styles from "@/styles/settings.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const back = useSearchParams().get("back")
  const [user, setUser] = useState<any>();

  useEffect(() => {
    async function getData() {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUser(data.user);
    }
    getData();
  }, []);

  return (
    <div className={styles.page}>
      <title>Settings</title>
      <ul className={styles.sideNav}>
        <li>Account</li>
        <li>App settings</li>
        <li>Something</li>
        <li>Something</li>
        <li>Something</li>
        <li>Something</li>
        <li>Something</li>
        <li>Something</li>
        <Link href={back ? String(back) : "/"}>
          Back
        </Link>
      </ul>

      <div className={styles.container}>
        {user ? (
          <>
            <ProfileSettings user={user} />
            <TaskSettings user={user} />
          </>
        ) : (
          <p style={{ fontSize: "20px" }}>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Page;
