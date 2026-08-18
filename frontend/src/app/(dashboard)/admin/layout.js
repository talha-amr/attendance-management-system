"use client";

import Navbar from "@/components/Navbar";
import AdminProvider from "@/context/AdminContext";

export default function AdminLayout({ children }) {
  return (
    <AdminProvider>
      <div className="min-h-screen bg-slate-50">
        <Navbar role="admin" />

        <main className="mx-auto max-w-7xl px-6 py-8">
          {children}
        </main>
      </div>
    </AdminProvider>
  );
}
