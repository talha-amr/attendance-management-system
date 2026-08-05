"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const redirectUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.replace("/auth");
          return;
        }

        const response = await fetch("http://127.0.0.1:8000/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("access_token");
          router.replace("/auth");
          return;
        }

        const data = await response.json();

        if (data.role === "admin") {
          router.replace("/admin/dashboard");
        } else if (data.role === "teacher") {
          router.replace("/teacher/dashboard");
        } else if (data.role === "student") {
          router.replace("/student/dashboard");
        } else {
          setError("Unknown user role.");
        }
      } catch {
        setError("Could not load user data.");
      }
    };

    redirectUser();
  }, [router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <p className="text-slate-600">Redirecting...</p>
    </main>
  );
}