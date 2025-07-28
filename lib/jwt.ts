// lib/jwt.ts

import { SignJWT, jwtVerify } from "jose";
import { type NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// 🔐 Generate a JWT token with user payload
export async function signJWT(payload: object) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// ✅ Verify JWT token from cookie
export async function verifyJWT(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload;
}

// 🍪 Set token as HttpOnly cookie on response
export async function setUserSession(
  user: { id: string; email: string; name?: string; role?: string },
  response: NextResponse
) {
  const token = await signJWT({
    id: user.id,
    email: user.email,
    name: user.name || "",
    role: user.role || "user",
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
