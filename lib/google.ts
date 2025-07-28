export async function getGoogleTokens(code: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri:
        "https://nextauth-git-main-udyandsuradkars-projects.vercel.app/api/oauth/google/callback",
      grant_type: "authorization_code",
    }),
  });

  return await res.json();
}

export async function getGoogleUser(access_token: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  return await res.json();
}
