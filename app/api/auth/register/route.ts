// app/api/auth/register/route.ts

import { db } from "@../../../lib/db";
import { hashPassword } from "@../../../lib/auth";
import { setUserSession } from "@../../../lib/jwt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      console.log("Missing fields");
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const password_hash = await hashPassword(password);
    console.log("Password hashed:", password_hash);

    const query = `
      INSERT INTO users (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, role;
    `;

    const values = [email, password_hash, name];
    const result = await db.query(query, values);
    const user = result.rows[0];

    console.log("User inserted:", user);

    // ✅ Set cookie with JWT
    const res = NextResponse.redirect(new URL("/dashboard/user", req.url));
    await setUserSession(user, res);

    return res;
  } catch (err: any) {
    console.error("Registration error:", err.message);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
