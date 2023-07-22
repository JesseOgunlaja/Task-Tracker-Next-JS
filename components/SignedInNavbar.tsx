"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/styles/nav.module.css";
import Image from "next/image";

const SignedInNavbar = () => {
  const [navShowing, setNavShowing] = useState<boolean | null>(null);

  return (
    <div>
      <nav className={styles.nav}>
        <ul>
          <li>
            <Link href="/dashboard" className={styles.website}>
              <Image
                className={styles.image}
                priority
                src="/favicon.ico"
                alt=""
                height={35}
                width={35}
              ></Image>{" "}
              TaskMaster
            </Link>
          </li>
          <li className={styles.bar}>
            <div
              className={styles.actualBar}
              onClick={() => setNavShowing(!navShowing)}
            >
              <hr className={styles.bar1} />
              <hr className={styles.bar2} />
              <hr className={styles.bar3} />
            </div>
          </li>
        </ul>
      </nav>
      <div
        className={
          navShowing != null
            ? navShowing
              ? styles.sideNavTrue
              : styles.sideNavFalse
            : undefined
        }
      >
        <div className={navShowing != null ? styles.phoneLinks : undefined}>
          <Link onClick={() => setNavShowing(false)} href="/why-taskmaster">
            Why TaskMaster?
          </Link>
          <Link onClick={() => setNavShowing(false)} href="/features">
            Features
          </Link>
          <Link onClick={() => setNavShowing(false)} href="/signUp">
            Sign up
          </Link>
          <Link onClick={() => setNavShowing(false)} href="/logIn">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignedInNavbar;
