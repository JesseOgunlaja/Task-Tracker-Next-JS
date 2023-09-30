"use client";

import { usePathname } from "next/navigation";
import React from "react";
import SignedInNavbar from "./SignedInNavbar";
import Navbar from "./Navbar";

const ClientOverallNav = ({ signedIn }: { signedIn: boolean }) => {
  const pathname = usePathname();

  const showBar =
    pathname.includes("/terms-and-conditions") ||
    pathname.includes("/privacy-policy") ||
    pathname.includes("/settings");
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
