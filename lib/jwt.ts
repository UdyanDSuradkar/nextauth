import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { type NextResponse } from "next/server";

// Use an encoded JWT secret
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// Define a payload type that matches what you'll store in JWT
type UserJWTPayload = JWTPayload & {
  id: string;
  email: string;
  name?: string;
  role?: string;
};

// 🔐 Sign a JWT with the user payload
export async function signJWT(payload: UserJWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // expires in 7 days
    .sign(JWT_SECRET);
}

// ✅ Verify and decode a JWT token
export async function verifyJWT(token: string): Promise<UserJWTPayload> {
  const { payload } = await jwtVerify<UserJWTPayload>(token, JWT_SECRET);
  return payload;
}

// 🍪 Set the JWT token as a cookie in the response
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
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
