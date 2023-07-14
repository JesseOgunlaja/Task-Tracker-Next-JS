"use client"

import SignUpForm from "@/components/SignUpForm";
import styles from "@/styles/signUp.module.css";
import Image from "next/image";

const page = () => {
  return (
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
        <SignUpForm/>
      </div>
    </div>
  );
};

export default page;
