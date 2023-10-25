import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: String(process.env.REDIS_URL),
  token: String(process.env.REDIS_TOKEN),
});

import { UUID } from "crypto";
export async function getByEmail(
  email: string,
  getKey?: boolean
): Promise<User | { user: User; key: string } | undefined> {
  const users = (await redis.lrange(
    "Username and emails",
    0,
    -1
  )) as unknown as Record<string, any>[];
  const emails: any[] = users.map(
    (val) => (val as unknown as Record<string, unknown>)?.email
  );
  console.log(emails);

  if (emails.includes(email.toLowerCase())) {
    console.log(emails.indexOf(email.toLowerCase()));
    const key = users[emails.indexOf(email.toLowerCase())].id;
    const user = await redis.hgetall(key);
    if (getKey === true) {
      return { user: user as User, key };
    }
    return user as User;
  } else {
    return undefined;
  }
}

export async function getByName(
  name: string,
  getKey?: boolean
): Promise<User | { user: User; key: string } | undefined> {
  const users = (await redis.lrange(
    "Username and emails",
    0,
    -1
  )) as unknown as Record<string, any>[];
  const names: any[] = users.map(
    (val) => (val as unknown as Record<string, unknown>)?.name
  );
  if (names.includes(name.toUpperCase())) {
    console.log("HI");
    const key = users[names.indexOf(name.toUpperCase())].id;
    console.log(key);
    const user = await redis.hgetall(key);
    console.log(user);
    if (getKey === true) {
      return { user: user as User, key };
    }
    return user as User;
  } else {
    return undefined;
  }
}

export type Types = "to-do" | "in-progress" | "done";

export type Priorities = "High" | "Low" | "Medium";

export type Task = {
  title: string;
  date: string;
  description: string;
  type: Types;
  priority: Priorities;
};

export type User = {
  name: string;
  password: string;
  email: string;
  uuid: UUID;
  tasks: Task[];
  projects: {
    name: string;
    date: string;
    priority: Priorities;
    section: Types;
    type: string;
    tasks: Task[];
  }[];
  settings: {
    twoFactorAuth: boolean;
    dateFormat: "dd/MM/yyyy" | "yyyy-MM-dd" | "MM/dd/yyyy";
    timeFormat: 12 | 24;
    calendars: string[];
  };
};
