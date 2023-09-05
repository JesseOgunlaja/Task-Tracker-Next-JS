"use client";

import FormPassword from "@/components/FormPassword";
import styles from "@/styles/logIn.module.css";
import { errorToast, promiseToast } from "@/utils/toast";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { encryptString } from "@/utils/encryptString";
import { decryptString } from "@/utils/decryptString";
import * as jose from "jose";
import TwoFactorAuth from "@/components/TwoFactorAuth";
import { toast } from "react-toastify";
import GoogleButton from "@/components/GoogleButton";

const Page = () => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const credentialsRef = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLDivElement>(null);
  const SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_SECRET_KEY);
  const [showTwoFactorAuth, setShowTwoFactorAuth] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    async function getCredentials() {
      async function decodeJWT(jwt: any) {
        return await jose.jwtVerify(jwt, SECRET);
      }
      const credentials = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`credentials=`))
        ?.replace(`credentials=`, "");
      if (!credentials) {
        return;
      }
      const decoded = await decodeJWT(String(credentials));
      const payload = decoded.payload;
      if (!payload) {
        return;
      }
      if (!payload.name || !payload.password) {
        return;
      }
      usernameRef.current!.value = decryptString(String(payload.name), true);
      credentialsRef.current!.checked = true;
      const outerPassword = passwordInput.current?.firstChild as HTMLDivElement;
      const passwordRef = outerPassword.firstChild as HTMLInputElement;
      passwordRef.value = decryptString(String(payload.password), true);
    }
    getCredentials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        success: "Valid credentials",
        error: {
          render({ data }: any) {
            if (data.message === "Invalid credentials") {
              return "Invalid credentials";
            } else {
              return "An error occurred. Please try again";
            }
          },
        },
      };
      await promiseToast(fetchUrl, fetchOptions, message, async (data: any) => {
        async function setCredentials() {
          const header = { alg: "HS256", typ: "JWT" };

          const payload = {
            name: encryptString(String(formValues.Username), true),
            password: encryptString(String(formValues.password), true),
          };
          const userCredentials = await new jose.SignJWT(payload)
            .setProtectedHeader(header)
            .setIssuedAt()
            .setExpirationTime("30d")
            .sign(SECRET);

          const setCookie = (name: any, value: any, daysToExpire: number) => {
            const date = new Date();
            date.setTime(date.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
            const expires = "expires=" + date.toUTCString();
            document.cookie = name + "=" + value + ";" + expires + ";path=/";
          };

          setCookie("credentials", userCredentials, 30);
        }
        if (data.name && data.email && data.twoFactorAuth === true) {
          setCredentials();
          setPassword(String(formValues.password));
          setName(data.name);
          setEmail(data.email);
          setShowTwoFactorAuth(true);
        } else {
          if (formValues.rememberCredentials === "on") {
            setCredentials();
          }
          window.location.reload();
        }
      });
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
    let data: any;
    const fetchRequest = new Promise((resolve, reject) => {
      fetch("/api/googleLogin", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          googleCode: credentials,
        }),
      }).then(async (response) => {
        data = await response.json();
        if (data.message === "Success") {
          window.location.reload();
          resolve(data);
        } else {
          reject(data);
        }
      });
    });
    await toast.promise(fetchRequest, {
      pending: "Loading",
      success: "Valid credentials",
      error: {
        render() {
          if (data.message === "Email in use") {
            return "Email isn't registered with google";
          } else {
            return "An error occured, please try again";
          }
        },
      },
    });
    if (data.message === "Sucess") {
      window.location.reload();
    }
  }

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => signUpWithGoogle(codeResponse.access_token),
  });

  return (
    <>
      <title>Log in</title>
      <div className={styles.page}>
        <div className={styles.container}>
          {!showTwoFactorAuth ? (
            <>
              <h1>Log in</h1>
              <br></br>
              <GoogleButton googleFunction={login} />
              <p className={styles.continue}>Or continue with</p>
              <form
                style={{ marginTop: "30px" }}
                className={styles.form}
                onSubmit={submit}
              >
                <input
                  ref={usernameRef}
                  autoComplete="off"
                  name="Username"
                  type="text"
                  placeholder="Username/Email"
                />
                <div ref={passwordInput}>
                  <FormPassword style={style} />
                </div>
                <div>
                  <label htmlFor="rememberCredentials">Remember me</label>
                  <input
                    ref={credentialsRef}
                    type="checkbox"
                    id="rememberCredentials"
                    name="rememberCredentials"
                  />
                  <p onClick={redirect}>Forgot password?</p>
                </div>
                <label className={styles.terms}>
                  By clicking Log In, you agree to our{" "}
                  <Link href="/privacy-policy">Privacy policy</Link> and{" "}
                  <Link href="/terms-and-conditions">Terms of service</Link>
                </label>
                <input type="Submit" value="Log in" readOnly />
              </form>
              <div className={styles.account}>
                <p>Don&apos;t have an account?</p>
                <Link href="signUp">Sign up now</Link>
              </div>
            </>
          ) : (
            <>
              <TwoFactorAuth email={email} name={name} password={password} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
