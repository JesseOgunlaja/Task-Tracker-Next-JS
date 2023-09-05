import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: String(process.env.REDIS_URL),
  token: String(process.env.REDIS_TOKEN),
});

import { UUID } from "crypto";
export async function getByEmail(
  email: string,
  getKey?: boolean,
): Promise<User | { user: User; key: string } | undefined> {
  const keys = await redis.keys("*");
  for (const key of keys) {
    if ((await redis.type(key)) === "hash") {
      const user = await redis.hgetall(key);
      if (user?.email === email.toLowerCase()) {
        if (getKey === true) {
          return { user: user as User, key };
        }
        return user as User;
      }
    }
  }
  return undefined;
}

export async function getByName(
  name: string,
  getKey?: boolean,
): Promise<User | { user: User; key: string } | undefined> {
  const keys = await redis.keys("*");
  for (const key of keys) {
    if ((await redis.type(key)) === "hash") {
      const user = await redis.hgetall(key);
      if (user?.name === name.toUpperCase()) {
        if (getKey === true) {
          return { user: user as User, key };
        } else {
          return user as User;
        }
      }
    }
  }
  return undefined;
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
