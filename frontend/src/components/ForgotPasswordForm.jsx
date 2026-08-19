"use client";

import { useState } from "react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      return setError("Email is required.");
    }

    try {
      setLoading(true);
      const forgotForm={
        "email":email
      }  
      const response=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,{
        method:"POST",
        headers:{
            "content-type":"application/json"
        },
        body: JSON.stringify(forgotForm)
      })
      const data=await response.json()
      if(response.ok)
        setMessage(data.message)
      else
        setMessage(data.message)
        
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm font-semibold text-indigo-600">
          PASSWORD RECOVERY
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Forgot your password?
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter your email address and we’ll send you a password reset link.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@example.com"
              autoComplete="email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Send Reset Link"}
          </button>
        </form>

        <a
          href="/auth"
          className="mt-6 block text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          Back to login
        </a>
      </section>
    </main>
  );
}