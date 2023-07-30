"use client";

import CheckCode from "@/components/CheckCode";
import OverallNav from "@/components/OverallNav";
import styles from "@/styles/reset-password.module.css";
import { errorToast } from "@/utils/toast";
import { FormEvent, useRef, useState } from "react";

const page = () => {
  const [validName, setValidName] = useState<boolean>(false);
  const email = useRef("");
  const name = useRef("");

  function redirect() {
    window.location.href = window.location.href
      .replace(window.location.pathname, "")
      .concat("/logIn");
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget); // create form data object
    const formValues = Object.fromEntries(formData.entries()); // convert form data object to plain object
    if (formValues.username === "") {
      errorToast("Invalid username or password");
    } else {
      const res = await fetch("/api/checkEmail", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          name: String(formValues.username),
        }),
      });
      const data = await res.json();
      if (data.success) {
        email!.current = data.email;
        name!.current = String(formValues.username);
        setValidName(true);
      } else {
        errorToast("No user found with that username");
      }
    }
  }

  return (
    <>
      <OverallNav />
      <div className={styles.page}>
        <div className={styles.container}>
          {validName === false ? (
            <>
              <form onSubmit={submit} className={styles.form}>
                <label htmlFor="username">Username</label>
                <input autoFocus autoComplete="off" type="text" name="username" id="username" />
                <input type="submit" />
              </form>
              <button onClick={redirect} className={styles.backButton}>
                Back
              </button>
            </>
          ) : (
            <>
              <CheckCode name={name.current} email={email.current} />
              <button onClick={() => {setValidName(false)}} className={styles.backButton}>
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default page;
