"use client";

import SignUpForm from "@/components/SignUpForm";
import styles from "@/styles/signingUp.module.css";
import { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    async function connect() {
      await fetch("/api/connect");
    }
    connect();
  }, []);
  return (
    <>
      <title>Sign up</title>
      <div className={styles.page}>
        <div className={styles.container}>
          <h1>Sign up</h1>
          <br />
          <SignUpForm />
        </div>
      </div>
    </>
  );
};

export default Page;
