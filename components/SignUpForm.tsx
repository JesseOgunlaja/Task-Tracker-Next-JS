import styles from "@/styles/signUp.module.css";
import VerificationCodeForm from "@/components/VerificationCodeForm";
import Link from "next/link";
import { SyntheticEvent, createContext, useRef, useState } from "react";

const validEmails = ["com", "org", "co.uk", "net", "io", "online", "dev"];

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
        return {error: true}
      } else if (email.includes("@") === false) {
        setEmailError("Invalid email");
        return {error: true}
      } else if (
        email.split("@")[1] == null ||
        email.split("@")[1] == undefined ||
        email.split("@")[1] === ""
      ) {
        setEmailError("Invalid email");
        return {error: true}
      } else if (email.split("@")[1].includes(".") === false) {
        setEmailError("Invalid email");
        return {error: true}
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
        return {error: true}
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
        return {error: true}
      } else {
        setEmailError("");
        return {error: false}
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
          return {error: true}
      } else if (password.includes(" ")) {
          setPasswordError("Spaces not allowed");
          return {error: true}
      } else if (password.length < 8 || password.length > 64) {
          setPasswordError("Password must be between 8 and 64 characters");
          return {error: true}
      } else {
        setPasswordError("");
        return {error: false}
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
        return {error: true}
      } else if (name.length < 5 || name.length > 25) {
        setNameError("Username must be between 5 and 25 characters");
        return {error: true}
      } else if (name.includes(" ")) {
        setNameError("Spaces not allowed");
        return {error: true}
      } else if (symbols.test(name)) {
        setNameError("No symbols allowed");
        return {error: true}
      } else {
        setNameError("");
        return {error: false}
      }
  }

  function submit(e: SyntheticEvent) {
    e.preventDefault();
    if (emailError === "" && nameError === "" && passwordError === "") {
      setSubmitted(true);
    }
    else {
        console.log(checkEmail()?.error)
        console.log(checkPassword()?.error)
        console.log(checkName()?.error)
    }
  }

  return (
    <>
      {submitted === false ? (
        <>
          <form className={styles.form} onSubmit={submit}>
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
          <div className={styles.account}>
            <p>Already have an account?</p>
            <Link href="/logIn">Log in now</Link>
          </div>
        </>
      ) : (
            <VerificationCodeForm email={emailInput.current?.value}/>
      )}
    </>
  );
};

export default SignUpForm;
