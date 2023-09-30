"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const GoogleProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  if (
    pathname.includes("/signUp") ||
    pathname.includes("/logIn") ||
    pathname.includes("/settings")
  ) {
    return (
      <GoogleOAuthProvider clientId="127574879175-5f5ath1lrnqnc83t4tntdv30i8s92amu.apps.googleusercontent.com">
        {children}
      </GoogleOAuthProvider>
    );
  } else {
    return <>{children}</>;
  }
};

export default GoogleProvider;
