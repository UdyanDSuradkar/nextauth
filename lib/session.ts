import { SignJWT } from "jose";
import { cookies } from "next/headers";

type UserPayload = {
  id: string;
  email: string;
  role: "user" | "admin" | string; // adjust if you have fixed roles
};

export async function setUserSession(user: UserPayload, response: Response) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  cookies().set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
