"use client";

import styles from "@/styles/logIn.module.css";
import { errorToast, successToast } from "@/utils/toast";
import Image from "next/image";
import Link from "next/link";
import { FormEvent } from "react";

const page = () => {

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget); // create form data object
    const formValues = Object.fromEntries(formData.entries()); // convert form data object to plain object
    if (formValues.Username === "" || formValues.Password === "") {
      errorToast("Invalid username or password");
    }
    else {
      const res = await fetch('/api/logIn', {
        method: 'POST',
        headers:{
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          username: formValues.Username, 
          password: formValues.Password
        })
      })
      const data = await res.json()
      if(data.message === "Success") {
        successToast("Successful login")
      }
      else {
        errorToast("Invalid credentials")
      }
    }
  }

  return (
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
          <input name="Password" type="password" placeholder="Password" />
          <input type="Submit" />
        </form>
        <div className={styles.account}>
          <p>Don't have an account?</p>
          <Link href="signUp">Sign up now</Link>
        </div>
      </div>
    </div>
  );
};

export default page;
