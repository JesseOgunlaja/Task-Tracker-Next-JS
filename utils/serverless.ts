"use server";

import { redis } from "./redis";

export async function getCode(email: string) {
  const code = await redis.get(email);
  return code as number;
}

export async function sendEmail(body: Record<string, unknown>, url: string) {
  await fetch(`${url}/api/sendEmail`, {
    method: "POST",
    headers: {
      authorization: process.env.GLOBAL_KEY,
    },
    body: JSON.stringify(body),
  });
}

export async function changePassword(
  props: Record<string, unknown>,
  formValues: Record<string, unknown>,
  url: string,
) {
  const res = await fetch(`${url}/api/reset-password`, {
    method: "PATCH",
    headers: {
      authorization: process.env.GLOBAL_KEY,
    },
    body: JSON.stringify({
      email: props.email,
      code: props.code,
      password: formValues.password,
    }),
  });
  const data = await res.json();
  if (res.ok && res.status === 200) {
    return { success: true, data };
  }
  return { success: false, data };
}
