import styles from "@/styles/signingUp.module.css";
import { decryptString } from "@/utils/decryptString";
import { encryptString } from "@/utils/encryptString";
import { errorToast, promiseToast } from "@/utils/toast";
import { FormEvent, useEffect, useRef } from "react";
import * as jose from "jose";

const VerificationCodeForm = (props: any) => {
  const CODE = encryptString(
    String(Math.floor(Math.random() * 1000000000)),
    true,
  );

  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function sendEmail() {
      if (codeInput.current) {
        codeInput.current.value = "";
      }
      const SECRET = new TextEncoder().encode(
        process.env.NEXT_PUBLIC_SECRET_KEY,
      );
      const payload = {
        KEY: process.env.NEXT_PUBLIC_GLOBAL_KEY,
        exp: Math.floor(Date.now() / 1000) + 5,
      };

      const header = { alg: "HS256", typ: "JWT" };
      const jwt = await new jose.SignJWT(payload)
        .setProtectedHeader(header)
        .setIssuedAt()
        .setExpirationTime("5s")
        .sign(SECRET);

      await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          authorization: jwt,
        },
        body: JSON.stringify({
          email: props.email,
          code: CODE,
        }),
      });
    }
    if (props.ready) {
      sendEmail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.ready]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    const fetchUrl = "/api/addUser";
    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        name: props.name,
        email: props.email,
        password: props.password,
        code: formValues.code,
      }),
    };
    const message = {
      success: "User registered",
      error: "Incorrect code",
    };
    promiseToast(
      fetchUrl,
      fetchOptions,
      message,
      () =>
        (window.location.href = window.location.href.replace(
          window.location.pathname,
          "/logIn",
        )),
    );
  }

  return (
    <>
      {props.email ? (
        <p className={styles.email}> Just sent an email to: {props.email}</p>
      ) : (
        <p className={styles.email}>
          Just send a verification code to the email registered with your
          account
        </p>
      )}
      <form className={styles.form} onSubmit={submit}>
        <input
          ref={codeInput}
          type="number"
          name="code"
          placeholder="Verification Code"
        />
        <input type="submit" />
      </form>
    </>
  );
};

export default VerificationCodeForm;
