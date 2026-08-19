"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("access_token");

        if (!token) {
          router.replace("/auth");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          router.replace("/auth");
          return;
        }

        if (!response.ok) {
          setError(data.detail || "Could not load user.");
          return;
        }

        setUser(data);
      } catch {
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [router]);

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    router.replace("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
