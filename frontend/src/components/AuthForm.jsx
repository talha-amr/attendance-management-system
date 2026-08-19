"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(mode !== "signup");
  const [signupRole, setSignupRole] = useState("student");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
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

  const handleSignupRoleChange = (role) => {
    setSignupRole(role);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    if (!isLogin && !formData.name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!isLogin && formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // -----------------------------
      // LOGIN
      // -----------------------------

      if (isLogin) {
        const loginData = new URLSearchParams();

        loginData.append("username", formData.email);
        loginData.append("password", formData.password);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: loginData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.detail || "Login failed.");
          return;
        }

        localStorage.setItem("access_token", data.access_token);

        setMessage("Logged In Successfully");

        router.replace("/dashboard");

        return;
      }

      // -----------------------------
      // SIGNUP
      // -----------------------------

      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      let signupEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/user`;

      // Teacher signup uses the teacher-specific endpoint.
      if (signupRole === "teacher") {
        signupEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/teachers/signup`;
      }

      const response = await fetch(signupEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Registration failed.");
        return;
      }

      if (signupRole === "teacher") {
        setMessage(
          "Teacher account registered successfully. Please wait for administrator approval."
        );
      } else {
        setMessage("Student account registered successfully.");
      }

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFormMode = () => {
    setIsLogin((previousMode) => !previousMode);

    setSignupRole("student");
    setError("");
    setMessage("");

    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-indigo-700 to-blue-500 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-blue-100 uppercase">
              School Attendance
            </p>

            <h1 className="mt-5 text-4xl leading-tight font-bold">
              Manage attendance with clarity and confidence.
            </h1>

            <p className="mt-5 max-w-md leading-7 text-blue-100">
              A central platform for students, teachers, attendance records,
              and academic activity.
            </p>
          </div>

          <p className="text-sm text-blue-100">
            Attendance Tracking System
          </p>
        </div>

        <div className="px-6 py-10 sm:px-12 lg:px-14 lg:py-14">
          <div className="mb-8">
            <p className="text-sm font-semibold text-indigo-600">
              {isLogin ? "WELCOME BACK" : "GET STARTED"}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {isLogin
                ? "Sign in to your account"
                : "Create your account"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {isLogin
                ? "Enter your details to continue."
                : signupRole === "teacher"
                  ? "Enter your information to register as a teacher."
                  : "Enter your information to register as a student."}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {message}
            </div>
          )}

          {!isLogin && (
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-slate-700">
                Register as
              </p>

              <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() =>
                    handleSignupRoleChange("student")
                  }
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    signupRole === "student"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Student
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSignupRoleChange("teacher")
                  }
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    signupRole === "teacher"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Teacher
                </button>
              </div>

              {signupRole === "teacher" && (
                <p className="mt-2 text-xs text-amber-700">
                  Teacher accounts require approval from an administrator.
                </p>
              )}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>

                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <input
                type="email"
                id="email"
                name="email"
                placeholder={
                  !isLogin && signupRole === "teacher"
                    ? "teacher@example.com"
                    : "student@example.com"
                }
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete={
                  isLogin ? "current-password" : "new-password"
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>

                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Enter your password again"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign In"
                  : signupRole === "teacher"
                    ? "Register as Teacher"
                    : "Create Student Account"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-600">
            {isLogin
              ? "Don’t have an account?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={toggleFormMode}
              className="ml-2 font-semibold text-indigo-600 hover:text-indigo-800"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}