import styles from "@/styles/signUp.module.css";
import VerificationCodeForm from "@/components/VerificationCodeForm";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { errorToast } from "@/utils/toast";

const validEmails = ["com", "org", "co.uk", "net", "io", "online", "dev", "co"];

const SignUpForm = () => {
  const [nameError, setNameError] = useState<String>("");
  const [emailError, setEmailError] = useState<String>("");
  const [passwordError, setPasswordError] = useState<String>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const nameInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  function checkEmail() {
    const email = emailInput.current?.value;

    if (
      typeof email !== "string" ||
      email === "" ||
      email == undefined ||
      email == null ||
      email.split("@")[0] === ""
    ) {
      setEmailError("Email required");
      return { error: true };
    } else if (email.includes("@") === false) {
      setEmailError("Invalid email");
      return { error: true };
    } else if (
      email.split("@")[1] == null ||
      email.split("@")[1] == undefined ||
      email.split("@")[1] === ""
    ) {
      setEmailError("Invalid email");
      return { error: true };
    } else if (email.split("@")[1].includes(".") === false) {
      setEmailError("Invalid email");
      return { error: true };
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
      return { error: true };
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
      return { error: true };
    } else {
      setEmailError("");
      return { error: false };
    }
  }

  function checkPassword() {
    const password = passwordInput.current?.value;

    if (
      password === "" ||
      password == null ||
      password == undefined ||
      typeof password !== "string"
    ) {
      setPasswordError("Password required");
      return { error: true };
    } else if (password.includes(" ")) {
      setPasswordError("Spaces not allowed");
      return { error: true };
    } else if (password.length < 8 || password.length > 64) {
      setPasswordError("Password must be between 8 and 64 characters");
      return { error: true };
    } else {
      setPasswordError("");
      return { error: false };
    }
  }

  function checkName() {
    let symbols = /[^a-zA-Z0-9\s]/;
    let name = nameInput.current?.value;

    if (
      name === "" ||
      name == null ||
      name == undefined ||
      typeof name !== "string"
    ) {
      setNameError("Username required");
      return { error: true };
    } else if (name.length < 5 || name.length > 25) {
      setNameError("Username must be between 5 and 25 characters");
      return { error: true };
    } else if (name.includes(" ")) {
      setNameError("Spaces not allowed");
      return { error: true };
    } else if (symbols.test(name)) {
      setNameError("No symbols allowed");
      return { error: true };
    } else {
      setNameError("");
      return { error: false };
    }
  }

  async function checkDuplicate(name: String, email: string) {
    const res = await fetch("/api/checkDuplicate", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        email: email,
      }),
    });
    const data = await res.json()
    if(data.nameDuplicate) {
      errorToast(`Username ${name} is already in use`)
      if(data.emailDuplicate) {
        errorToast(`Email ${email} is already in use`)
      }
      return false
    }
    else if(data.emailDuplicate) {
      errorToast(`Email ${email} is already in use`)
      return false
    }
    else {
      return true
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      emailError === "" &&
      nameError === "" &&
      passwordError === "" &&
      !checkEmail()?.error &&
      !checkPassword()?.error &&
      !checkName()?.error
    ) {
      if(await checkDuplicate(nameInput.current?.value || "", emailInput.current?.value || "")) {
        setSubmitted(true);
      }
    } else {
      checkEmail()?.error;
      checkPassword()?.error;
      checkName()?.error;
    }
  }

  return (
    <>
      <>
        <>
          <form
            className={styles.form}
            style={!submitted ? { display: "flex" } : { display: "none" }}
            onSubmit={submit}
          >
            <input
              ref={nameInput}
              onChange={() => checkName()}
              type="text"
              placeholder="Username"
            />
            {nameError !== "" && (
              <div className={styles.error}>{nameError}</div>
            )}
            <input
              onChange={() => checkEmail()}
              ref={emailInput}
              type="text"
              placeholder="Email"
            />
            {emailError !== "" && (
              <div className={styles.error}>{emailError}</div>
            )}
            <input
              onChange={() => checkPassword()}
              ref={passwordInput}
              type="password"
              placeholder="Password"
            />
            {passwordError !== "" && (
              <div className={styles.error}>{passwordError}</div>
            )}
            <input type="submit" />
          </form>
          <div
            style={!submitted ? { display: "block" } : { display: "none" }}
            className={styles.account}
          >
            <p>Already have an account?</p>
            <Link href="/logIn">Log in now</Link>
          </div>
        </>
        <div
          className={styles.verif}
          style={submitted ? { display: "flex" } : { display: "none" }}
        >
          <VerificationCodeForm
            ready={submitted}
            name={nameInput.current?.value}
            password={passwordInput.current?.value}
            email={emailInput.current?.value}
          />
          <button
            onClick={() => setSubmitted(false)}
            className={styles.backButton}
          >
            Back
          </button>
        </div>
      </>
    </>
  );
};

export default SignUpForm;
