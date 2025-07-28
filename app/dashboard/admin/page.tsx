// app/dashboard/admin/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "../../../lib/jwt";

export default async function AdminDashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    console.log("❌ No token found. Redirecting to /login");
    redirect("/login");
  }

  try {
    const user = await verifyJWT(token); // Decode and verify

    if (user.role !== "admin") {
      console.log("❌ Not an admin. Redirecting to /dashboard/user");
      redirect("/dashboard/user");
    }

    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-lg mb-2">Welcome, {user.name}!</p>
        <p className="text-gray-600 mb-6">Role: {user.role}</p>

        {/* Placeholder */}
        <div className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">👥 Users Overview</h2>
          <p className="text-sm text-gray-500">
            This is where you’ll list users with pagination.
          </p>
        </div>

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
  }
}
