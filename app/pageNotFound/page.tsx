"use client";

import Link from "next/link";
import { CSSProperties, useEffect, useState } from "react";

const Page = () => {
  const [seconds, setSeconds] = useState(20); // Starting count value

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds((prevCount) => prevCount - 1);
      } else {
        window.location.href = window.location.href.replace(
          window.location.pathname,
          "/",
        );
      }
    }, 1000); // 1000 milliseconds = 1 second

    return () => {
      clearInterval(interval); // Clean up the interval when the component unmounts
    };
  }, [seconds]);

  const style: CSSProperties = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "black",
    color: "white",
    flexDirection: "column",
    fontSize: "20px",
  };

  return (
    <div style={style}>
      <p>You don&apos; have a project with this index</p>
      <p>Redirecting you to home page in {seconds} seconds</p>
      <Link href="/">Go now</Link>
    </div>
  );
};

export default Page;
