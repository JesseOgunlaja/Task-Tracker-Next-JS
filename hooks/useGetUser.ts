import { User } from "@/utils/redis";
import { errorToast } from "@/utils/toast";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function useGetUser() {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    async function getData() {
      const res = await fetch(`/api/user`);
      const data = await res.json();
      if (data.user != undefined && Object.keys(data.user).length !== 0) {
        setUser(data.user);
      } else {
        errorToast("An error occured. Please reload the page and try again.");
      }
    }
    getData();
  }, []);

  return [user, setUser] as [
    User | undefined,
    Dispatch<SetStateAction<User | undefined>>,
  ];
}
