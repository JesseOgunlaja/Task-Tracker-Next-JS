import styles from "@/styles/signUp.module.css";
import { FormEvent, useRef, useState } from "react";

const SignUpForm = (props: any) => {
    const codeInput = useRef<HTMLInputElement>(null)
  

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
  }

  return (
    <>
    <p className={styles.email}>Just sent an email to: {props.email}</p>
    <form className={styles.form} onSubmit={submit}>
        <input ref={codeInput} type="number" name="VerificationCode" placeholder="Verification Code"/>     
      <input type="submit" />
    </form>
    </>
  );
};

export default SignUpForm;
