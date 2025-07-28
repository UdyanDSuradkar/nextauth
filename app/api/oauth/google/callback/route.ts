//app\api\oauth\google\callback\route.ts
import { NextResponse } from "next/server";
import { getGoogleTokens, getGoogleUser } from "@../../../lib/oauth";
import { db } from "@../../../lib/db";
import { setUserSession } from "@../../../lib/jwt";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  // const _state = searchParams.get("state"); // Optional: For CSRF protection

  if (!code) {
    console.log("❌ No authorization code found in callback URL");
    return NextResponse.json(
      { error: "Missing Google auth code" },
      { status: 400 }
    );
  }

  try {
    console.log("🔄 Exchanging code for Google tokens...");
    const { access_token } = await getGoogleTokens(code);

    console.log("✅ Tokens received — Fetching user info...");
    const googleUser = await getGoogleUser(access_token);
    console.log("👤 Google User:", googleUser);

    const { email, name, sub: providerId } = googleUser;

    if (!email || !providerId) {
      console.warn("⚠️ Missing required Google profile info");
      return NextResponse.json(
        { error: "Incomplete Google user profile" },
        { status: 400 }
      );
    }

    console.log("🔍 Checking if user exists in database...");
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    let user = result.rows[0];

    if (!user) {
      console.log("🆕 No user found — creating new user...");
      const insert = await db.query(
        `INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING *`,
        [email, name, "user"]
      );
      user = insert.rows[0];
    }

    console.log("🔗 Linking Google account to user...");
    const linkResult = await db.query(
      `INSERT INTO oauth_accounts (user_id, provider, provider_account_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (provider, provider_account_id) DO NOTHING
       RETURNING *`,
      [user.id, "google", providerId]
    );

    if (linkResult.rowCount === 0) {
      console.log("ℹ️ OAuth account already linked.");
    } else {
      console.log("✅ OAuth account successfully linked.");
    }

    console.log("🍪 Setting session cookie...");
    const redirectUrl = new URL("/dashboard/user", req.url);
    let response = NextResponse.redirect(redirectUrl);

    // ✅ Await the session-setting function
    response = await setUserSession(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      response
    );

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Google OAuth callback error:", message);
    return NextResponse.json(
      { error: "Google OAuth failed", detail: message },
      { status: 500 }
    );
  }
}
