import React, { FormEvent, useEffect, useRef, useState } from "react";
import styles from "@/styles/reset-password.module.css";
import { encryptString } from "@/utils/encryptString";
import { errorToast, successToast } from "@/utils/toast";
import ChangePassword from "./ChangePassword";
import { sendEmail } from "@/utils/serverless";
import { getCode } from "@/utils/serverless";

const CheckCode = (props: { email: string }) => {
  const changePassword = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const emailParagraph = useRef<HTMLParagraphElement>(null);
  const code = useRef<number>();

  useEffect(() => {
    if (changePassword.current) {
      changePassword.current.style.display = "none";
    }
  }, []);

  useEffect(() => {
    sendEmail(
      {
        email: props.email,
        code: encryptString(
          String(Math.floor(Math.random() * 1000000000)),
          true
        ),
      },
      window.location.origin
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    const CODE = await getCode(props.email);
    if (Number(formValues.code) === CODE) {
      successToast("Correct code");
      code.current = Number(formValues.code);
      changePassword.current!.style.display = "block";
      form.current!.style.display = "none";
      emailParagraph.current!.style.display = "none";
    } else {
      errorToast("Incorrect code");
    }
  }

  return (
    <>
      <p ref={emailParagraph} className={styles.sent}>
        An email was sent to {props.email}
      </p>
      <form ref={form} onSubmit={submit} className={styles.form}>
        <label htmlFor="code">Verification code</label>
        <input autoFocus autoComplete="off" type="text" name="code" id="code" />
        <input type="submit" />
      </form>
      <div ref={changePassword}>
        <ChangePassword email={props.email} code={Number(code.current)} />
      </div>
    </>
  );
};

export default CheckCode;
