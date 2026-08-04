"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          router.push("/auth");
          return;
        }

      
        const response = await fetch("http://127.0.0.1:8000/user/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
        });
       const data= await response.json()
       if (response.ok)
        setUser(data)
       else
        alert("data not retrieved coorectly")

      } catch (error) {
        setError("Could not load user data.");
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-indigo-600">
          DASHBOARD
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Welcome, {user?.name || "User"}
        </h1>

        <div className="mt-8 space-y-4">
          <div>
            <p className=" text-slate-500">Name</p>
            <p className="text-lg font-semibold text-slate-900">
              {user?.name || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-semibold text-slate-900">
              {user?.email || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Role</p>
            <p className="font-semibold text-slate-900">
              {user?.role || "-"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}