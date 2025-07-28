// lib/oauth.ts
import qs from "querystring";

// === GOOGLE ===
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI =
  "https://nextauth-nine-pearl.vercel.app/api/oauth/google/callback";

export async function getGoogleTokens(code: string) {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: qs.stringify(values),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`❌ Failed to fetch Google tokens: ${error}`);
  }

  return res.json(); // { access_token, id_token, etc. }
}

export async function getGoogleUser(access_token: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`❌ Failed to fetch Google user: ${error}`);
  }

  return res.json(); // { sub, email, name, picture, etc. }
}

// === GITHUB ===
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const GITHUB_REDIRECT_URI =
  "https://nextauth-nine-pearl.vercel.app/api/oauth/github/callback";

export async function getGitHubTokens(code: string) {
  const url = "https://github.com/login/oauth/access_token";
  const values = {
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: GITHUB_REDIRECT_URI,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`❌ Failed to fetch GitHub tokens: ${error}`);
  }

  return res.json(); // { access_token }
}

export async function getGitHubUser(access_token: string) {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`❌ Failed to fetch GitHub user: ${error}`);
  }

  const profile = await res.json();

  // GitHub may return null email, so fallback
  return {
    email: profile.email || `${profile.login}@github.temp`,
    name: profile.name || profile.login,
    id: profile.id.toString(),
  };
}
