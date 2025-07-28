// app/api/oauth/google/callback/route.ts

import { NextResponse } from "next/server";
import { getGoogleTokens, getGoogleUser } from "@../../../lib/oauth";
import { db } from "@../../../lib/db";
import { setUserSession } from "@../../../lib/jwt";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    console.log("❌ No code found");
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    console.log("🔄 Getting Google Tokens...");
    const { access_token, id_token } = await getGoogleTokens(code);
    console.log("✅ Tokens received");

    console.log("🔄 Getting Google User...");
    const googleUser = await getGoogleUser(access_token, id_token);
    console.log("✅ Google User:", googleUser);

    const { email, name, sub: providerId } = googleUser;

    console.log("🔍 Checking user in DB...");
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    let user = result.rows[0];

    if (!user) {
      console.log("🆕 Creating new user...");
      const insert = await db.query(
        `INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *`,
        [email, name]
      );
      user = insert.rows[0];
    }

    console.log("🔗 Linking oauth_accounts...");
    await db.query(
      `INSERT INTO oauth_accounts (user_id, provider, provider_account_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (provider, provider_account_id) DO NOTHING`,
      [user.id, "google", providerId]
    );

    console.log("🍪 Setting session cookie...");
    const response = NextResponse.redirect(new URL("/dashboard/user", req.url));
    await setUserSession(user, response);

    console.log("✅ OAuth Success — Redirecting to dashboard!");
    return response;
  } catch (err: any) {
    console.error("❌ OAuth error:", err.message || err);
    return NextResponse.json({ error: "OAuth failed" }, { status: 500 });
  }
}
