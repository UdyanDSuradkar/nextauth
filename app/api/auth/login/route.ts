import { db } from "../../../../lib/db";
import { comparePassword } from "../../../../lib/auth";
import { signJWT } from "../../../../lib/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // 🧾 Check input fields
    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 🧑‍ Find user by email
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // 🔐 Check password
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🪙 Create JWT
    const token = await signJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // 📍 Determine redirect path based on role
    const redirectPath =
      user.role === "admin" ? "/dashboard/admin" : "/dashboard/user";

    // 🍪 Set token in HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        redirect: redirectPath,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error(
      "Login error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
