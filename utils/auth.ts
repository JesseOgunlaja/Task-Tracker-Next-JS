import { jwtVerify } from 'jose'
import { NextRequest } from 'next/server';

export async function verifyJWT(req: NextRequest) {
    const headersList = new Headers(req.headers)
    const token = headersList.get("authorization");
    try {
        const verified = await jwtVerify(
          token!,
          new TextEncoder().encode(process.env.SECRET_KEY)
        )
        return verified as any
      } catch (error) {
        return new Response(`${error}`, {status: 500})
      }
}