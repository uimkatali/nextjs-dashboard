"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dumbbell, Zap, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{
    message: string;
    field?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError({ message: "Passwords don't match", field: "confirmPassword" });
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/login");
      } else {
        setError({ message: data.message });
      }
    } catch (err) {
      setError({ message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-bounce"></div>
      </div>

      <Card className="w-full max-w-md bg-slate-800/90 border-slate-700 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Dumbbell className="h-8 w-8 text-cyan-400" />
            <Zap className="h-6 w-6 text-pink-400 animate-pulse" />
          </div>

          <div className="space-y-2">
            <CardTitle
              className="text-3xl font-bold text-white"
              style={{
                textShadow:
                  "0 0 20px rgba(34, 211, 238, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)",
              }}
            >
              JOIN THE ENERGY
            </CardTitle>
            <CardDescription className="text-slate-300">
              Create your account and start your fitness journey
            </CardDescription>
            <Badge
              variant="secondary"
              className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30"
            >
              <UserPlus className="w-3 h-3 mr-1" />
              NEW MEMBER
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200 font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-slate-200 font-medium"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 ${
                  error?.field === "confirmPassword" ? "border-red-400" : ""
                }`}
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-md p-2">
                {error.message}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </div>
              )}
            </Button>
          </form>

          <Separator className="bg-slate-600" />

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
