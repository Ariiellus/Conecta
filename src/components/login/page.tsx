"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function LoginPage() {
  const { ready, authenticated, login, logout } = usePrivy();
  const [_, setLocation] = useLocation();

  // ✅ Redirect to main page if already logged in
  useEffect(() => {
    if (ready && authenticated) {
      setLocation("/dashboard"); // Redirecting to the dashboard
    }
  }, [ready, authenticated, setLocation]);

  // ✅ Ensure `ready` is true before showing buttons
  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-lg">Loading Privy...</div>;
  }

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/"); // Redirect to main page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Conecta</h1>
        <p className="mb-4">Log in to access the platform</p>

        {!authenticated ? (
          <button
            onClick={login}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Log in with Privy
          </button>
        ) : (
          <>
            <p className="text-green-600 mb-2">✅ Logged in successfully! Redirecting...</p>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Log Out
            </button>
          </>
        )}
      </div>
    </div>
  );
}