"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { login, ready, authenticated } = usePrivy();
  const [_, setLocation] = useLocation();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (ready && authenticated) {
      setLocation("/dashboard");
    }
  }, [ready, authenticated, setLocation]);

  // Handle login button click
  const handleLogin = () => {
    login();
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="ml-3 text-xl font-semibold">Conecta</span>
            </div>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Welcome to Conecta</h1>
            <p className="text-gray-500 mt-2">Sign in to your account</p>
          </div>

          <div className="space-y-6">
            <Button 
              onClick={handleLogin} 
              className="w-full bg-primary hover:bg-primary-dark"
            >
              Sign in with Privy
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Secure authentication
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500">
              By signing in, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">© 2025 Conecta. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}