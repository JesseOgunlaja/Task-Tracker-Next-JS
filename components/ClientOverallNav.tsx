"use client";

import SignedInNavbar from "./SignedInNavbar";
import Navbar from "./Navbar";

const ClientOverallNav = ({ signedIn }: any) => {
  const showBar = true;
  return (
    <div>
      {" "}
      {!showBar && (
        <>{signedIn ? <SignedInNavbar pathname={"/"} /> : <Navbar />}</>
      )}
    </div>
  );
};

export default ClientOverallNav;
