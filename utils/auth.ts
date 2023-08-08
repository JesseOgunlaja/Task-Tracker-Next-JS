import { jwtVerify } from "jose";

export async function verifyJWT(jwt: string, client?: boolean) {
  try {
    const verified = await jwtVerify(
      jwt,
      new TextEncoder().encode(
        client ? process.env.NEXT_PUBLIC_SECRET_KEY : process.env.SECRET_KEY,
      ),
    );
    return verified as any;
  } catch (error) {
    return new Response(`${error}`, { status: 500 });
  }
}
