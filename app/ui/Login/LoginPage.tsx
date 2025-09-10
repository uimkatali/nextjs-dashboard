"use client";

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
import {
  Eye,
  EyeOff,
  Zap,
  Dumbbell,
  AlertCircle,
  Flame,
  CloudLightning as Lightning,
} from "lucide-react";
import { Separator } from "@radix-ui/react-context-menu";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginError {
  message: string;
  field?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear errors when user starts typing
  };

  const validateForm = (): boolean => {
    if (!formData.email) {
      setError({ message: "Email is required", field: "email" });
      return false;
    }

    if (!formData.password) {
      setError({ message: "Password is required", field: "password" });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError({
        message: "Please enter a valid email address",
        field: "email",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to home page
        router.push("/home");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-cyan-400 rotate-45 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 border-2 border-pink-500 rotate-12 animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-cyan-400/30 rotate-45 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 border border-pink-400 rounded-full animate-ping delay-500"></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-gradient-to-r from-cyan-400 to-pink-500 rotate-45 animate-spin delay-700"
          style={{ animationDuration: "3s" }}
        ></div>
      </div>

      <Card className="w-full max-w-md bg-slate-900/95 backdrop-blur-sm border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-pink-500/10 animate-pulse"></div>

        <CardHeader className="text-center space-y-4 relative z-10">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 rounded-full border-2 border-cyan-400/50 relative">
              <Dumbbell className="w-8 h-8 text-cyan-400" />
              <Zap className="w-3 h-3 text-pink-400 absolute -top-1 -right-1 animate-pulse" />
              <Flame className="w-3 h-3 text-orange-400 absolute -bottom-1 -left-1 animate-bounce" />
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle
              className="text-4xl font-black text-white tracking-tight drop-shadow-lg"
              style={{
                textShadow:
                  "0 0 20px rgba(34, 211, 238, 0.8), 0 0 40px rgba(34, 211, 238, 0.4), 0 0 60px rgba(236, 72, 153, 0.3)",
              }}
            >
              POWER UP
            </CardTitle>
            <Badge
              variant="outline"
              className="border-cyan-400 text-white bg-cyan-600/80 backdrop-blur-sm"
            >
              <Zap className="w-3 h-3 mr-1" />
              ENERGY MODE
            </Badge>
          </div>

          <CardDescription className="text-slate-300 text-lg font-medium">
            Ready to crush your limits? Let's get started!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-cyan-300 font-bold text-sm uppercase tracking-wider flex items-center gap-2"
              >
                <Lightning className="w-3 h-3" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@gym.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`h-12 bg-slate-800/50 border-2 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 text-white placeholder:text-slate-400 backdrop-blur-sm ${
                  error?.field === "email"
                    ? "border-red-400 focus:border-red-400"
                    : "border-slate-700 focus:border-cyan-400"
                }`}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-cyan-300 font-bold text-sm uppercase tracking-wider flex items-center gap-2"
              >
                <Flame className="w-3 h-3" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`h-12 bg-slate-800/50 border-2 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 pr-12 text-white placeholder:text-slate-400 backdrop-blur-sm ${
                    error?.field === "password"
                      ? "border-red-400 focus:border-red-400"
                      : "border-slate-700 focus:border-cyan-400"
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{error.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Button
              className="w-full h-14 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white font-black text-lg uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 border-2 border-cyan-400/50 hover:border-cyan-300 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              {loading ? (
                <div className="flex items-center gap-2 relative z-10">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>LOGGING IN...</span>
                </div>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse relative z-10" />
                  <span className="relative z-10">LET'S GO!</span>
                </>
              )}
            </Button>
          </form>

          <Separator className="bg-slate-700" />

          <div className="text-center space-y-3">
            <Button
              variant="link"
              className="text-slate-400 hover:text-cyan-300 transition-colors font-medium"
              onClick={() => router.push("/forgot-password")}
            >
              Forgot your password?
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-400">
                New to the gym?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-pink-400 hover:text-pink-300 font-bold"
                  onClick={() => router.push("/signup")}
                >
                  Sign up now
                </Button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
