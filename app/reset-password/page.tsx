"use client";

import CheckCode from "@/components/CheckCode";
import styles from "@/styles/reset-password.module.css";
import { errorToast, promiseToast } from "@/utils/toast";
import { FormEvent, useRef, useState } from "react";

const Page = () => {
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
      const fetchUrl = "/api/checkEmail";
      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          email: String(formValues.email),
        }),
      };
      const message = {
        success: "User found",
        error: {
          render({ data }: any) {
            if (data.message === "Can't reset password for GMAIL") {
              return "Can't reset password for GMAIL";
            } else {
              return "User not found";
            }
          },
        },
      };
      await promiseToast(fetchUrl, fetchOptions, message, (data: any) => {
        email!.current = data.email;
        name!.current = String(formValues.username);
        setValidName(true);
      });
    }
  }

  return (
    <>
      <div className={styles.page}>
        <div className={styles.container}>
          {validName === false ? (
            <>
              <form onSubmit={submit} className={styles.form}>
                <label htmlFor="email">Email</label>
                <input
                  autoFocus
                  autoComplete="off"
                  type="text"
                  name="email"
                  id="email"
                />
                <input type="submit" />
              </form>
              <button onClick={redirect} className={styles.backButton}>
                Back
              </button>
            </>
          ) : (
            <>
              <CheckCode email={email.current} />
              <button
                onClick={() => {
                  setValidName(false);
                }}
                className={styles.backButton}
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
