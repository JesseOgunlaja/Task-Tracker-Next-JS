import React, { FormEvent, useEffect, useRef, useState } from "react";
import styles from "@/styles/reset-password.module.css";
import { encryptString } from "@/utils/encryptString";
import { errorToast } from "@/utils/toast";
import { decryptString } from "@/utils/decryptString";
import ChangePassword from "./ChangePassword";
const jwt = require("jsrsasign");

const CheckCode = (props: any) => {
  const changePassword = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const code = useRef(
    encryptString(String(Math.floor(Math.random() * 1000000000)), true),
  );

  useEffect(() => {
    if (changePassword.current) {
      changePassword.current.style.display = "none";
    }
  }, []);

  useEffect(() => {
    async function sendEmail() {
      const SECRET: String = process.env.NEXT_PUBLIC_SECRET_KEY || "";
      const payload = {
        KEY: process.env.NEXT_PUBLIC_GLOBAL_KEY,
        exp: Math.floor(Date.now() / 1000) + 5,
      };
      const header = { alg: "HS256", typ: "JWT" };
      const sHeader = JSON.stringify(header);
      const sPayload = JSON.stringify(payload);
      const globalToken = jwt.jws.JWS.sign("HS256", sHeader, sPayload, SECRET);
      await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          authorization: globalToken,
        },
        body: JSON.stringify({
          email: props.email,
          code: code.current,
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
    if (formValues.code === decryptString(String(code.current), true)) {
      if (changePassword.current && form.current) {
        changePassword.current.style.display = "block";
        form.current.style.display = "none";
      }
    } else {
      errorToast("Incorrect code");
    }
  }

  return (
    <>
      <p className={styles.sent}>An email was sent to {props.email}</p>
      <form ref={form} onSubmit={submit} className={styles.form}>
        <label htmlFor="code">Verification code</label>
        <input autoFocus autoComplete="off" type="text" name="code" id="code" />
        <input type="submit" />
      </form>
      <div ref={changePassword}>
        <ChangePassword email={props.email} />
      </div>
    </>
  );
};

export default CheckCode;
