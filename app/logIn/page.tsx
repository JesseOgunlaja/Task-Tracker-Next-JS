"use client";

import OverallNav from "@/components/OverallNav";
import FormPassword from "@/components/FormPassword";
import styles from "@/styles/logIn.module.css";
import { errorToast, promiseToast } from "@/utils/toast";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const Page = () => {
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
        window.location.reload(),
      );
    }
  }

  function redirect() {
    window.location.href = window.location.href.replace(
      window.location.pathname,
      "/reset-password",
    );
  }

  const style = {
    width: "350px",
    marginBottom: "0px",
  };

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
      window.location.reload();
    }
    if (data.message === "Email in use") {
      errorToast("Email isn't registered with google");
    }
  }

  return (
    <>
      <GoogleOAuthProvider clientId="127574879175-5f5ath1lrnqnc83t4tntdv30i8s92amu.apps.googleusercontent.com">
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
            <form
              style={{ marginTop: "30px" }}
              className={styles.form}
              onSubmit={submit}
            >
              <input
                autoComplete="off"
                name="Username"
                type="text"
                placeholder="Username/Email"
              />
              <FormPassword style={style} />
              <p onClick={redirect}>Forgot password?</p>
              <label className={styles.terms}>
                By clicking Log In, you agree to our{" "}
                <Link href="/privacy-policy">Privacy policy</Link> and{" "}
                <Link href="/terms-and-conditons">Terms of service</Link>
              </label>
              <input type="Submit" />
            </form>
            <div className={styles.account}>
              <p>Don&apos;t have an account?</p>
              <Link href="signUp">Sign up now</Link>
            </div>
          </div>
        </div>
      </GoogleOAuthProvider>
    </>
  );
};

export default Page;
