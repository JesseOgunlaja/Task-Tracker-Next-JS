"use client";

import React from "react";
import SignedInNavbar from "./SignedInNavbar";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

const notSignedInPaths: String[] = [
  "/",
  "/why-taskmaster",
  "/features",
  "/signUp",
  "/logIn",
  "/reset-password",
];

const OverallNav = () => {
  const pathname = usePathname();
  return (
    <div>
      {notSignedInPaths.every((val) => val != pathname) ? (
        <SignedInNavbar />
      ) : (
        <Navbar />
      )}
    </div>
  );
};

export default OverallNav;
