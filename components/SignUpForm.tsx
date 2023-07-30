import styles from "@/styles/signUp.module.css";
import VerificationCodeForm from "@/components/VerificationCodeForm";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { errorToast } from "@/utils/toast";
import Password from "./Password";
import { emailSchema, passwordSchema, usernameSchema } from "@/utils/zod";

const SignUpForm = () => {
  const password = useRef("");
  const [nameError, setNameError] = useState<String>("");
  const [emailError, setEmailError] = useState<String>("");
  const [passwordError, setPasswordError] = useState<String>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const nameInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  function checkEmail() {
    const email = emailInput.current?.value;
    const result = emailSchema.safeParse(email);

    if (result.success) {
      setEmailError("");
      return { error: false };
    } else {
      setEmailError(result.error.format()._errors[0]);
      return { error: true };
    }
  }

  function checkPassword() {
    const element = passwordInput.current?.firstChild as HTMLDivElement;
    let innerElement = element.firstChild as HTMLInputElement;
    const password = innerElement.value;
    const result = passwordSchema.safeParse(password);

    if (result.success) {
      setPasswordError("");
      return { error: false };
    } else {
      setPasswordError(result.error.format()._errors[0]);
      return { error: true };
    }
  }

  function checkName() {
    const name = nameInput.current?.value;
    const result = usernameSchema.safeParse(name);

    if (result.success) {
      setNameError("");
      return { error: false };
    } else {
      setNameError(result.error.format()._errors[0]);
      return { error: true };
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
    const data = await res.json();
    if (data.nameDuplicate) {
      errorToast(`Username ${name} is already in use`);
      if (data.emailDuplicate) {
        errorToast(`Email ${email} is already in use`);
      }
      return false;
    } else if (data.emailDuplicate) {
      errorToast(`Email ${email} is already in use`);
      return false;
    } else {
      return true;
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
      if (
        await checkDuplicate(
          nameInput.current?.value || "",
          emailInput.current?.value || ""
        )
      ) {
        const element = passwordInput.current?.firstChild as HTMLDivElement;
        let innerElement = element.firstChild as HTMLInputElement;
        password.current = innerElement.value;
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
            <div onChange={() => checkPassword()} ref={passwordInput}>
              <Password />
            </div>
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
            password={password.current}
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
