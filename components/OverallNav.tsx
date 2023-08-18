"use client";

import SignedInNavbar from "./SignedInNavbar";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

const OverallNav = ({ navStatus }: { navStatus: string }) => {
  const pathname = usePathname();
  const showBar =
    pathname.includes("/terms-and-conditions") ||
    pathname.includes("/privacy-policy") ||
    pathname.includes("/settings");
  return (
    <div>
      {!showBar && (
        <>
          {navStatus === "yes" || pathname.includes("/projects") ? (
            <SignedInNavbar pathname={pathname} />
          ) : (
            <Navbar />
          )}
        </>
      )}
    </div>
  );
};

export default OverallNav;
