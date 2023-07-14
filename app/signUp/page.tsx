"use client";

import styles from "@/styles/signUp.module.css";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SyntheticEvent, useRef, useState } from "react";

const validEmails = ["com", "org", "co.uk", "net", "io", "online", "dev"];

const page = () => {
  const [nameError, setNameError] = useState<String>("");
  const [emailError, setEmailError] = useState<String>("");
  const [passwordError, setPasswordError] = useState<String>("");

  const nameInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  function checkEmail(type: string) {
    const email = emailInput.current?.value;

    if (type === "change") {
      if (email !== "" && emailError === "Email required") {
        setEmailError("");
      }
    } else {
      if (
        typeof email !== "string" ||
        email === "" ||
        email == undefined ||
        email == null ||
        email.split("@")[0] === ""
      ) {
        setEmailError("Email required");
      } else if (email.includes("@") === false) {
        setEmailError("Invalid email");
      } else if (
        email.split("@")[1] == null ||
        email.split("@")[1] == undefined ||
        email.split("@")[1] === ""
      ) {
        setEmailError("Invalid email");
      } else if (email.split("@")[1].includes(".") === false) {
        setEmailError("Invalid email");
      } else if (
        email
          .split("@")[1]
          .split(".", 2)
          .filter(
            (val) =>
              val !== "" &&
              val != null &&
              val != undefined &&
              typeof val === "string"
          ).length !== 2
      ) {
        setEmailError("Invaid email");
      } else if (
        validEmails.includes(
          email
            .split("@")[1]
            .split(".", 2)
            .filter(
              (val) =>
                val !== "" &&
                val != null &&
                val != undefined &&
                typeof val === "string"
            )[1]
        ) === false
      ) {
        setEmailError("Invaid email");
      } else {
        setEmailError("");
      }
    }
  }

  function checkPassword(type: string) {
    const password = passwordInput.current?.value;

    if (type === "change") {
      if (password !== "" && passwordError === "Password required") {
        setPasswordError("");
      }
    } else {
      if (
        password === "" ||
        password == null ||
        password == undefined ||
        typeof password !== "string"
      ) {
        setPasswordError("Password required");
      } else if (password.includes(" ")) {
        setPasswordError("Spaces not allowed");
      } else if (password.length < 8 || password.length > 64) {
        setPasswordError("Password must be between 8 and 64 characters");
      } else {
        setPasswordError("");
      }
    }
  }

  function checkName(type: string) {
    let symbols = /[^a-zA-Z0-9\s]/;
    let name = nameInput.current?.value;

    if (type === "change") {
      if (name !== "" && nameError === "Username required") {
        setNameError("");
      }
    } else {
      if (
        name === "" ||
        name == null ||
        name == undefined ||
        typeof name !== "string"
      ) {
        setNameError("Username required");
      } else if (name.length < 5 || name.length > 25) {
        setNameError("Username must be between 5 and 25 characters");
      } else if (name.includes(" ")) {
        setNameError("Spaces not allowed");
      } else if (symbols.test(name)) {
        setNameError("No symbols allowed");
      } else {
        setNameError("");
      }
    }
  }

  function submit(e: SyntheticEvent) {
    e.preventDefault();
    checkEmail("blur");
    checkPassword("blur");
    checkName("blur");
    if (passwordError === "" && emailError === "" && nameError === "") {
      console.log("Success");
    }
  }

  return (
    <div className={styles.page}>
      <title>Sign up</title>
      <div className={styles.container}>
        <div className={styles.header}>
          <img
            className={styles.logo}
            src="/favicon.ico"
            alt="Website logo"
            height={45}
            width={45}
          />
          <h1 className={styles.title}>TaskMaster</h1>
        </div>
        <form className={styles.form} onSubmit={submit}>
          <input
            ref={nameInput}
            onChange={() => checkName("change")}
            onBlur={() => checkName("blur")}
            type="text"
            placeholder="Username"
          />
          {nameError !== "" && <div className={styles.error}>{nameError}</div>}
          <input
            onBlur={() => checkEmail("blur")}
            onChange={() => checkEmail("change")}
            ref={emailInput}
            type="text"
            placeholder="Email"
          />
          {emailError !== "" && (
            <div className={styles.error}>{emailError}</div>
          )}
          <input
            onBlur={() => checkPassword("blur")}
            onChange={() => checkPassword("change")}
            ref={passwordInput}
            type="password"
            placeholder="Password"
          />
          {passwordError !== "" && (
            <div className={styles.error}>{passwordError}</div>
          )}
          <input type="submit" />
        </form>
        <div className={styles.account}>
          <p>Already have an account?</p>
          <Link href="/logIn">Log in now</Link>
        </div>
      </div>
    </div>
  );
};

export default page;
