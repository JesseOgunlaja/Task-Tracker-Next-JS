import styles from "@/styles/signUp.module.css";
import { decryptString } from "@/utils/decryptString";
import { encryptString } from "@/utils/encryptString";
import { errorToast, successToast } from "@/utils/toast";
import { FormEvent, useEffect, useRef, useState } from "react";
const jwt = require("jsrsasign");


const SignUpForm = (props: any) => {
  
  const [code,setCode] = useState<String>(encryptString(String(Math.floor(Math.random() * 1000000000)), true))
  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function sendEmail() {
      if(codeInput.current) {
        codeInput.current.value = ""
      }
      const SECRET: String = process.env.NEXT_PUBLIC_SECRET_KEY || "";
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
        SECRET
        );
        await fetch("/api/sendEmail", {
          method: "POST",
          headers: {
            authorization: globalToken
          },
          body: JSON.stringify({
            email: props.email,
          code: code,
        }),
      });
    }
    if(props.ready) {
      sendEmail();
    }
  }, [props.ready]);
  
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    if(formValues.code === decryptString(code, true)) {
      const res = await fetch("/api/addUser", {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          name: props.name,
          email: props.email,
          password: props.password
        })
      })
      const data = await res.json()
      if(data.message === "Success") {
        successToast("User registered")
        window.location.href = window.location.href.replace(window.location.pathname,"").concat("/logIn")
      }
    }
    else {
      errorToast("Incorrect code")
    }
  }

  return (
    <>
      <p className={styles.email}>Just sent an email to: {props.email}</p>
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

export default SignUpForm;
