import styles from "@/styles/reset-password.module.css";
import Password from "./FormPassword";
import { errorToast, successToast } from "@/utils/toast";
import { FormEvent, useRef, useState } from "react";
import { z } from "zod";
import { changePassword } from "@/utils/serverless";

const passwordSchema = z
  .string()
  .min(8, {
    message: "Password must be more than 8 characters",
  })
  .max(64, {
    message: "Password must be less than 64 characters",
  })
  .regex(/^(?=.*[\W_])[a-zA-Z0-9\W_]+$/, {
    message: "String must contain at least one symbol",
  });

const ChangePassword = (props: { email: string; code: number }) => {
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
      const result = await changePassword(
        props,
        formValues,
        window.location.origin
      );
      if (result.success) {
        successToast("Successfully changed password");
        window.location.href = window.location.href.replace(
          window.location.pathname,
          "/logIn"
        );
      } else {
        errorToast("An error occurred. Please try again");
      }
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
