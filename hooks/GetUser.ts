import { User } from "@/utils/redis";
import { errorToast } from "@/utils/toast";
import { Dispatch, useEffect, useState } from "react";

export default function GetUser() {
  const [value, setValue] = useState<User>();

  useEffect(() => {
    async function getData() {
      const res = await fetch(`/api/user`);
      const data = await res.json();
      if (data.user != undefined && Object.keys(data.user).length !== 0) {
        setValue(data.user);
      } else {
        errorToast("An error occured. Please reload the page and try again.");
      }
    }
    getData();
  }, []);

  return [value, setValue] as [User, Dispatch<unknown>];
}
