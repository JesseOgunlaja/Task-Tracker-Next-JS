import styles from "@/styles/signingUp.module.css";
import { encryptString } from "@/utils/encryptString";
import { FormEvent, useEffect, useRef } from "react";
import * as jose from "jose";
import { errorToast, promiseToast, successToast } from "@/utils/toast";

const TwoFactorAuth = (props: {
  password: string;
  name: string;
  email: string;
}) => {
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
    sendEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    const fetchUrl = "/api/logIn";
    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        code: Number(formValues.code),
        username: props.name,
        password: props.password,
      }),
    };
    const message = {
      success: {
        render() {
          return "Successful login";
        },
      },
      error: "Invalid code",
    };
    await promiseToast(fetchUrl, fetchOptions, message, () =>
      window.location.reload(),
    );
  }

  return (
    <>
      <p className={styles.email}> Just sent an email to: {props.email}</p>
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

export default TwoFactorAuth;
