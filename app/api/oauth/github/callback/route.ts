import { getGitHubTokens, getGitHubUser } from "@../../../lib/oauth";
import { db } from "@../../../lib/db";
import { setUserSession } from "@../../../lib/jwt";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    const { access_token } = await getGitHubTokens(code);

    const githubUser = await getGitHubUser(access_token);
    const { email, name, id: providerId } = githubUser;

    const userResult = await db.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    let user = userResult.rows[0];

    if (!user) {
      const insert = await db.query(
        `INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *`,
        [email, name]
      );
      user = insert.rows[0];
    }

    // Link provider
    await db.query(
      `INSERT INTO oauth_accounts (user_id, provider, provider_account_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (provider, provider_account_id) DO NOTHING`,
      [user.id, "github", providerId]
    );

    // Set token + redirect
    const res = NextResponse.redirect(new URL("/dashboard/user", req.url));
    await setUserSession(user, res);
    return res;
  } catch (err) {
    console.error("GitHub OAuth error:", err);
    return NextResponse.json({ error: "OAuth failed" }, { status: 500 });
  }
}
