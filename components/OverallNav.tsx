import { headers } from "next/headers";
import ClientOverallNav from "./ClientOverallNav";
import { checkSignedIn } from "@/utils/checkSignedIn";

const OverallNav = async () => {
  const headersList = headers();
  const token = headersList
    .get("cookie")
    ?.split(";")
    .find((cookie) => cookie.trim().startsWith("token" + "="))
    ?.split("=")[1]
    ?.trim();
  const signedIn = true;

  return (
    <div>
      <ClientOverallNav signedIn={signedIn} />
    </div>
  );
};

export default OverallNav;
