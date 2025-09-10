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
import { Dumbbell, Zap, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
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
              RESET ENERGY
            </CardTitle>
            <CardDescription className="text-slate-300">
              {success
                ? "Check your email for reset instructions"
                : "Enter your email to reset your password"}
            </CardDescription>
            <Badge
              variant="secondary"
              className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30"
            >
              <Mail className="w-3 h-3 mr-1" />
              RECOVERY MODE
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  Email Sent!
                </h3>
                <p className="text-slate-300 text-sm">
                  We've sent password reset instructions to{" "}
                  <span className="text-cyan-400">{email}</span>
                </p>
                <p className="text-slate-400 text-xs">
                  Check your spam folder if you don't see it in your inbox.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                  disabled={loading}
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-md p-2">
                  {error}
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
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Reset Password</span>
                  </div>
                )}
              </Button>
            </form>
          )}

          <Separator className="bg-slate-600" />

          <div className="text-center space-y-2">
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
            {success && (
              <div className="text-xs text-slate-400">
                Didn't receive an email?{" "}
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
