"use client";

import { usePathname } from "next/navigation";
import React from "react";
import SignedInNavbar from "./SignedInNavbar";
import Navbar from "./Navbar";

const ClientOverallNav = ({ signedIn }: any) => {
  const pathname = usePathname();

  const showBar = false;
  return (
    <div>
      {" "}
      {!showBar && (
        <>
          {signedIn ||
          (pathname.includes("/projects") && !pathname.includes("/logIn")) ? (
            <SignedInNavbar pathname={pathname} />
          ) : (
            <Navbar />
          )}
        </>
      )}
    </div>
  );
};

export default ClientOverallNav;
