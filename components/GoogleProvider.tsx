"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

const GoogleProvider = ({ children }: any) => {
  return (
    <GoogleOAuthProvider clientId="127574879175-5f5ath1lrnqnc83t4tntdv30i8s92amu.apps.googleusercontent.com">
      {children}
    </GoogleOAuthProvider>
  );
};

export default GoogleProvider;
