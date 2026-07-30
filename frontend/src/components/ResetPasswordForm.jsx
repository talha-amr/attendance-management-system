"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!formData.password || !formData.confirmPassword) {
      return setError("Both password fields are required.");
    }

    if (formData.password.length < 8) {
      return setError("Password must contain at least 8 characters.");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);
      const urlData=  useSearchParams()
      url_Token=urlData.get("token")
      const resetPass= {
        "token": url_Token,
        "new_password": formData.password
      }
      const response= await fetch("http://127.0.0.1:8000/auth/forgot-password",{
        method:"POST",
        headers:{
            "content-type":"application/json"
        },
        body:JSON.stringify(resetPass)
      })
      const data= await response.json()
      if (response.ok)
        setMessage(data.detail)
    else:
      /*
        ADD RESET PASSWORD LOGIC HERE

        Flow:
        1. Get token from URL
        2. Create reset request data
        3. Send POST request to backend
        4. Parse response.json()
        5. Check response.ok
        6. Success -> setMessage(...)
        7. Error -> setError(...)
        8. Later redirect to /auth
      */

      console.log("Reset password submitted");

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
          NEW PASSWORD
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Reset your password
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter your new password below.
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
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              New password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter new password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Confirm password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Enter password again"
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Reset Password"}
          </button>
        </form>
      </section>
    </main>
  );
}