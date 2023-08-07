"use client";

import OverallNav from "@/components/OverallNav";
import SignUpForm from "@/components/SignUpForm";
import styles from "@/styles/signingUp.module.css";
import Image from "next/image";
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
      <OverallNav />
      <div className={styles.page}>
        <title>Sign up</title>
        <div className={styles.container}>
          <div className={styles.header}>
            <Image
              className={styles.logo}
              src="/favicon.ico"
              alt="Website logo"
              height={45}
              width={45}
            ></Image>
            <h1 className={styles.title}>TaskMaster</h1>
          </div>
          <SignUpForm />
        </div>
      </div>
    </>
  );
};

export default Page;
