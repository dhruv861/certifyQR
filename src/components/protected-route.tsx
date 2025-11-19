"use client";

import { useEffect, useState } from "react";
import { isAuthenticated, clearAuthentication } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on component mount
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuth(true);
  };

  const handleLogout = () => {
    clearAuthentication();
    setIsAuth(false);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuth) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Show protected content with logout option
  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
            <nav className="flex gap-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Generate Certificate
              </Link>
              <Link href="/certificates" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                View Certificates
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/search" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Public Search
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Protected Content */}
      <main>{children}</main>
    </div>
  );
}
