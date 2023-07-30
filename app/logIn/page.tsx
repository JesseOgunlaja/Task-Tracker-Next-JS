"use client";

import OverallNav from "@/components/OverallNav";
import Password from "@/components/Password";
import styles from "@/styles/logIn.module.css";
import { errorToast, promiseToast, successToast } from "@/utils/toast";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect } from "react";

const { openDB } = require("idb");

// Function to initialize and open the IndexedDB database
async function initDB() {
  // Specify the database name and version
  const dbName = "my-db";
  const dbVersion = 1;

  // Open the database
  return await openDB(dbName, dbVersion, {
    upgrade(db: any) {
      // Create an object store called 'data' with an auto-incrementing key
      if (!db.objectStoreNames.contains("data")) {
        db.createObjectStore("data", { autoIncrement: true });
      }
    },
  });
}

async function clearAllData() {
  const db = await initDB();
  const tx = db.transaction("data", "readwrite");
  const store = tx.objectStore("data");
  await store.clear();
}

const page = () => {
  useEffect(() => {
    async function deleteData() {
      clearAllData()
    }
    deleteData()
  })
  useEffect(() => {
    async function connect() {
      await fetch("/api/connect");
    }
    connect();
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget); // create form data object
    const formValues = Object.fromEntries(formData.entries()); // convert form data object to plain object
    if (formValues.Username === "" || formValues.password === "") {
      errorToast("Invalid username or password");
    } else {
      const fetchUrl = "/api/logIn";
      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          username: formValues.Username,
          password: formValues.password,
        }),
      };
      const message = {
        success: "Successful login",
        error: "Invalid credentials",
      };
      promiseToast(fetchUrl, fetchOptions, message, () =>
        window.location.reload()
      );
    }
  }

  function redirect() {
    window.location.href = window.location.href
      .replace(window.location.pathname, "/reset-password")
  }

  const style = {
    width: "350px",
    "marginBottom": "0px"
  }

  return (
    <>
      <OverallNav />
      <div className={styles.page}>
        <title>Log in</title>
        <div className={styles.container}>
          <div className={styles.header}>
            <Image
              className={styles.logo}
              src="/favicon.ico"
              alt="Website logo"
              height={45}
              width={45}
            ></Image>
            <h1 className={styles.title}>TaskMaster</h1>
          </div>
          <form className={styles.form} onSubmit={submit}>
            <input name="Username" type="text" placeholder="Username/Email" />
            <Password style={style}/>
            <p onClick={redirect}>Forgot password?</p>
            <input type="Submit" />
          </form>
          <div className={styles.account}>
            <p>Don't have an account?</p>
            <Link href="signUp">Sign up now</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
