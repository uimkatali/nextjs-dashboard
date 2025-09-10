import { Card, CardContent } from "@/components/ui/card";
import { Badge, Zap, Dumbbell, Home, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          {/* Energy Mode Badge */}
          <Badge className="mb-6 bg-gradient-to-r from-pink-500 to-cyan-500 text-white border-0 px-4 py-2 text-sm font-bold tracking-wider">
            <Zap className="w-4 h-4 mr-2" />
            FITNESS MODE ACTIVATED
          </Badge>

          {/* Main Title */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white [text-shadow:0_0_30px_rgba(6,182,212,0.5),0_0_60px_rgba(236,72,153,0.3)]">
            POWER UP
          </h1>

          <p className="text-xl md:text-2xl text-cyan-100 mb-4 font-medium">
            Your Ultimate Exercise Management System
          </p>

          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Transform your fitness journey with custom workouts designed for
            both gym and home. Track progress, build routines, and unleash your
            potential.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800/90 backdrop-blur-sm border-cyan-400/30 hover:bg-slate-800/95 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Gym Workouts
              </h3>
              <p className="text-slate-300 text-sm">
                Create and customize intense gym routines with equipment
                tracking and progressive overload
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 backdrop-blur-sm border-cyan-400/30 hover:bg-slate-800/95 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Home Training
              </h3>
              <p className="text-slate-300 text-sm">
                Design effective bodyweight and minimal equipment workouts for
                any space
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 backdrop-blur-sm border-cyan-400/30 hover:bg-slate-800/95 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Custom Goals
              </h3>
              <p className="text-slate-300 text-sm">
                Set personalized targets and track your progress with detailed
                analytics
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-400 mb-1">500+</div>
            <div className="text-sm text-gray-400">Exercise Library</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-1">24/7</div>
            <div className="text-sm text-gray-400">Access Anywhere</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-400 mb-1">∞</div>
            <div className="text-sm text-gray-400">Custom Routines</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-1">100%</div>
            <div className="text-sm text-gray-400">Personalized</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 px-8 py-4 text-lg font-bold tracking-wide shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105"
            >
              <Zap className="w-5 h-5 mr-2" />
              START YOUR JOURNEY
            </Button>
          </Link>

          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 px-8 py-4 text-lg font-bold tracking-wide transition-all duration-300 hover:scale-105 bg-transparent"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              CONTINUE TRAINING
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400 text-sm">
          <p>Join thousands of athletes already transforming their fitness</p>
        </div>
      </div>
    </div>
  );
}
