import styles from "@/styles/signUp.module.css";
import { encryptString } from "@/utils/encryptString";
import { FormEvent, useEffect, useRef, useState } from "react";
const jwt = require("jsrsasign");

let code = String(Math.floor(Math.random() * 1000000000));

const SignUpForm = (props: any) => {
  const [codeError,setCodeError] = useState<boolean>(false)
  const codeInput = useRef<HTMLInputElement>(null);
  const email = props.email;

  useEffect(() => {
    async function sendEmail() {
      const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;
      const payload = {
        KEY: process.env.NEXT_PUBLIC_GLOBAL_KEY,
        exp: Math.floor(Date.now() / 1000) + 5,
      };
      const header = { alg: "HS256", typ: "JWT" };
      const sHeader = JSON.stringify(header);
      const sPayload = JSON.stringify(payload);
      const globalToken = jwt.jws.JWS.sign(
        "HS256",
        sHeader,
        sPayload,
        SECRET_KEY
      );
      await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          authorization: globalToken
        },
        body: JSON.stringify({
          email: email,
          code: encryptString(code, true),
        }),
      });
    }
    sendEmail();
  }, []);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    if(formValues.code === code) {
      setCodeError(false)
      console.log("Correct")
    }
    else {
      setCodeError(true)
    }
  }

  return (
    <>
      <p className={styles.email}>Just sent an email to: {email}</p>
      <form className={styles.form} onSubmit={submit}>
        <input
          ref={codeInput}
          type="number"
          name="code"
          placeholder="Verification Code"
        />
        {codeError && <p className={styles.error}>Incorrect code</p>}
        <input type="submit" />
      </form>
    </>
  );
};

export default SignUpForm;
