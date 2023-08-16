"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/styles/signedInNav.module.css";
import Image from "next/image";

const SignedInNavbar = ({ pathname }: any) => {
  const [navShowing, setNavShowing] = useState<boolean | null>(null);

  return (
    <div>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      ></link>
      <nav className={styles.nav}>
        <ul>
          <li>
            <Link href="/" className={styles.website}>
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
          <li>
            <Link href="/projects">Projects</Link>
          </li>
          <li className={styles.logout}>
            <Link href="/api/logout">Logout</Link>
          </li>
          <li>
            <Link href={`/settings?back=${pathname}`}>
              <i id={styles.faIcon} className="fa">
                &#xf013;
              </i>
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
          <Link onClick={() => setNavShowing(false)} href="/projects">
            Projects
          </Link>
          <Link onClick={() => setNavShowing(false)} href={`/settings?back=${pathname}`}>
            Settings
          </Link>
          <Link onClick={() => setNavShowing(false)} href="/api/logout">
            Log out
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignedInNavbar;
