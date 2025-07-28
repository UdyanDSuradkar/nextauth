// app/dashboard/user/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "../../../lib/jwt";

export default async function UserDashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    console.log("❌ No token found — redirecting to /login");
    redirect("/login");
    return null as never; // ✅ tells TypeScript this never returns
  }

  try {
    const user = await verifyJWT(token);

    if (!user || !user.email) {
      console.log("❌ Invalid decoded payload — redirecting to /login");
      redirect("/login");
      return null as never;
    }

    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">
          Welcome, {user.name || "User"}
        </h1>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role || "user"}
        </p>

        <form action="/api/auth/logout" method="POST" className="mt-6">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            type="submit"
          >
            Logout
          </button>
        </form>
      </div>
    );
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    redirect("/login");
    return null as never; // ✅ required here too
  }
}
