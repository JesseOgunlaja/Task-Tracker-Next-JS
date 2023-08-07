import styles from "@/styles/signingUp.module.css";
import VerificationCodeForm from "@/components/VerificationCodeForm";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { errorToast } from "@/utils/toast";
import FormPassword from "./FormPassword";
import { emailSchema, passwordSchema, usernameSchema } from "@/utils/zod";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const SignUpForm = () => {
  const password = useRef("");
  const termsCheckbox = useRef<HTMLInputElement>(null);
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
    
      function checkCheckBox() {
        console.log("hi")
        if(termsCheckbox.current?.checked) {
          return { error: false }
        }
        else {
          errorToast("To proceed, please review and agree to our Terms of Service and Privacy Policy by checking the box below", 10000)
          return { error: true }
        }
      }
    
    e.preventDefault();
    if (
      !checkCheckBox().error &&
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

  async function signUpWithGoogle(credentials: any) {
    const res = await fetch("/api/googleLogin", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        credentials: credentials,
      }),
    });
    const data = await res.json();
    if (data.message === "Success") {
      window.location.href = window.location.href.replace(
        window.location.pathname,
        "/dashboard"
      );
    }
    if (data.message === "Email in use") {
      errorToast("Email isn't registered with Google");
    }
  }

  return (
    <>
      <GoogleOAuthProvider clientId="127574879175-5f5ath1lrnqnc83t4tntdv30i8s92amu.apps.googleusercontent.com">
        <>
          <div className={styles.google}>
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                signUpWithGoogle(credentialResponse);
              }}
              onError={() => {
                console.log("Login Failed");
              }}
              text="signup_with"
              type="standard"
              width={350}
            />
          </div>
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
              <FormPassword />
            </div>
            {passwordError !== "" && (
              <div className={styles.error}>{passwordError}</div>
            )}
            <label className={styles.terms}>
              Do you agree with our{" "}
              <Link href="/privacy-policy">Privacy policy</Link> and{" "}
              <Link href="/terms-and-conditons">Terms of service</Link>
              <input type="checkbox" name="terms" id="terms" ref={termsCheckbox} className={styles.checkbox} />
            </label>
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
      </GoogleOAuthProvider>
    </>
  );
};

export default SignUpForm;
