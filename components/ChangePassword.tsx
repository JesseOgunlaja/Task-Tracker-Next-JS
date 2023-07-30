import styles from "@/styles/reset-password.module.css";
import Password from "./Password";
import { errorToast } from "@/utils/toast";
import { FormEvent, useRef, useState } from "react";
const jwt = require("jsrsasign");
import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, {
    message: "Password must be more than 8 characters",
  })
  .max(64, {
    message: "Password must be less than 64 characters",
  })
  .regex(/^(?=.*[\W_])[a-zA-Z0-9\W_]+$/, {
    message:
      "String must contain at least one symbol",
  });

const ChangePassword = (props: any) => {
  const passwordInput = useRef<HTMLDivElement>(null);
  const [passwordError, setPasswordError] = useState<string>();
  const style = {
    width: "350px",
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    if (checkPassword().error === false) {
      const SECRET: String = process.env.NEXT_PUBLIC_SECRET_KEY || "";
      const payload = {
        KEY: process.env.NEXT_PUBLIC_GLOBAL_KEY,
        exp: Math.floor(Date.now() / 1000) + 1,
      };
      const header = { alg: "HS256", typ: "JWT" };
      const sHeader = JSON.stringify(header);
      const sPayload = JSON.stringify(payload);
      const globalToken = jwt.jws.JWS.sign("HS256", sHeader, sPayload, SECRET);
      await fetch("/api/reset-password", {
        method: "PATCH",
        headers: {
          authorization: globalToken,
        },
        body: JSON.stringify({
          email: props.email,
          password: formValues.password,
        }),
      });
      window.location.href = window.location.href.replace(
        window.location.pathname,
        "/logIn"
      );
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

  return (
    <form onSubmit={submit} className={styles.form}>
      <label>Password</label>
      <div
        onChange={checkPassword}
        style={{ marginBottom: "0px", padding: "0px" }}
        ref={passwordInput}
      >
        <Password style={style} />
      </div>
      {passwordError !== "" && (
        <div className={styles.error}>{passwordError}</div>
      )}
      <input type="submit" />
    </form>
  );
};

export default ChangePassword;
