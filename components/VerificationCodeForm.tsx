import styles from "@/styles/signingUp.module.css";
import { promiseToast } from "@/utils/toast";
import { FormEvent } from "react";

let sent = false;

const VerificationCodeForm = (props: any) => {
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
        code: Number(formValues.code),
      }),
    };
    const message = {
      success: "User registered",
      error: "Incorrect code",
    };
    await promiseToast(
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
          defaultValue=""
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
