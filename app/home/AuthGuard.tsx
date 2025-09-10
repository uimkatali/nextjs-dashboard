"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await fetch("/api/auth/validate");
        const data = await response.json();

        if (data.valid) {
          setIsAuthenticated(true);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth validation failed:", error);
        router.push("/login");
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, [router]);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
