"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/styles/signedInNav.module.css";
import Image from "next/image";

const SignedInNavbar = ({ pathname }: { pathname: string }) => {
  const [navShowing, setNavShowing] = useState<boolean | null>(null);

  return (
    <div className={styles.wholeContainer}>
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
          <li>
            <Link href="/tasks">Tasks</Link>
          </li>
          <li className={styles.logout}>
            <a href="/api/logout">Logout</a>
          </li>
          <li>
            <Link
              href={`/settings?back=${
                pathname === "/changeEmailMagicLink" ? "/" : pathname
              }`}
            >
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
            : styles.phoneNav
        }
      >
        <div className={navShowing != null ? styles.phoneLinks : undefined}>
          <Link onClick={() => setNavShowing(false)} href="/projects">
            Projects
          </Link>
          <Link onClick={() => setNavShowing(false)} href="/tasks">
            Tasks
          </Link>
          <Link
            onClick={() => setNavShowing(false)}
            href={`/settings?back=${pathname}`}
          >
            Settings
          </Link>
          <a onClick={() => setNavShowing(false)} href="/api/logout">
            Log out
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignedInNavbar;
