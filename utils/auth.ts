import { jwtVerify } from 'jose'
import { NextRequest } from 'next/server';

export async function verifyJWT(jwt: string) {
    try {
        const verified = await jwtVerify(
          jwt,
          new TextEncoder().encode(process.env.SECRET_KEY)
        )
        return verified as any
      } catch (error) {
        return new Response(`${error}`, {status: 500})
      }
}