// app/api/oauth/github/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!;
  const redirectUri =
    process.env.GITHUB_REDIRECT_URI ||
    "http://localhost:3000/api/oauth/github/callback";

  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", clientId);
  githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
  githubAuthUrl.searchParams.set("scope", "read:user user:email");

  return NextResponse.redirect(githubAuthUrl.toString());
}
