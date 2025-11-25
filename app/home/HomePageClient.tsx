"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dumbbell,
  Target,
  TrendingUp,
  Calendar,
  Plus,
  Play,
  BarChart3,
  Trophy,
  Zap,
  Timer,
  Weight,
  RotateCcw,
  LogOut,
  Edit,
  History,
} from "lucide-react";
import EditWeightDialog from "./EditWeightDialog";
import WeightHistoryDialog from "./WeightHistoryDialog";

interface WorkoutSet {
  weight: number;
  reps: number;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
  targetSets: number;
}

interface UserStats {
  name: string;
  currentWeight: number;
  goalWeight: number;
  weeklyGoal: number;
  completedWorkouts: number;
  currentStreak: number;
  totalWorkouts: number;
}

interface HomePageClientProps {
  userStats: UserStats;
  onSaveWorkout: (workout: Exercise[]) => Promise<void>;
}

export default function HomePageClient({
  userStats: initialUserStats,
  onSaveWorkout,
}: HomePageClientProps) {
  const router = useRouter();
  const [userStats, setUserStats] = useState(initialUserStats);
  const [currentWorkout, setCurrentWorkout] = useState<Exercise[]>([]);
  const [newExercise, setNewExercise] = useState({
    name: "",
    weight: "",
    reps: "",
    sets: "",
  });
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditWeightOpen, setIsEditWeightOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const addExercise = () => {
    if (
      !newExercise.name ||
      !newExercise.weight ||
      !newExercise.reps ||
      !newExercise.sets
    )
      return;

    const exercise: Exercise = {
      id: Date.now().toString(),
      name: newExercise.name,
      targetSets: Number.parseInt(newExercise.sets),
      sets: Array.from({ length: Number.parseInt(newExercise.sets) }, () => ({
        weight: Number.parseInt(newExercise.weight),
        reps: Number.parseInt(newExercise.reps),
        completed: false,
      })),
    };

    setCurrentWorkout([...currentWorkout, exercise]);
    setNewExercise({ name: "", weight: "", reps: "", sets: "" });
  };

  const toggleSet = (exerciseId: string, setIndex: number) => {
    setCurrentWorkout((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set, index) =>
                index === setIndex ? { ...set, completed: !set.completed } : set
              ),
            }
          : exercise
      )
    );
  };

  const startWorkout = () => {
    setIsWorkoutActive(true);
  };

  const finishWorkout = async () => {
    setIsWorkoutActive(false);
    if (currentWorkout.length > 0) {
      await onSaveWorkout(currentWorkout);
    }
    setCurrentWorkout([]);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        router.push("/");
      } else {
        console.error("Logout failed:", data.message);
        // You could add a toast notification here if you have one
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Even on error, redirect to home as a fallback
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSaveWeight = async (
    currentWeight: number,
    goalWeight: number
  ) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentWeight,
          goalWeight,
          weeklyGoal: userStats.weeklyGoal,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setUserStats({
          ...userStats,
          currentWeight,
          goalWeight,
        });
      } else {
        throw new Error(data.message || "Failed to save weight");
      }
    } catch (error) {
      console.error("Save weight error:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/30 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/30 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-pink-400/10 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-pink-400/20 rounded-full blur-2xl animate-bounce delay-500" />
      </div>

      <div className="relative z-10 container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] text-shadow-[0_0_30px_rgba(236,72,153,0.5)]">
              POWER DASHBOARD
            </h1>
            <p className="text-slate-300 mt-2 text-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              Welcome back, {userStats.name}! Ready to crush your goals?
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white border-0 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <Zap className="w-4 h-4 mr-1" />
              ENERGY MODE
            </Badge>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="outline"
              size="sm"
              className="border-2 border-red-400/60 text-red-400 hover:bg-red-400 hover:text-white transition-all duration-300 bg-transparent backdrop-blur-sm"
            >
              {isLoggingOut ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/90 backdrop-blur-sm border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Current Weight
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                  onClick={() => setIsHistoryOpen(true)}
                  title="View weight history"
                >
                  <History className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                  onClick={() => setIsEditWeightOpen(true)}
                  title="Edit weight"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Weight className="h-4 w-4 text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                {userStats.currentWeight}kg
              </div>
              <p className="text-xs text-slate-400">
                Goal: {userStats.goalWeight}kg
              </p>
              <Progress
                value={
                  userStats.goalWeight > userStats.currentWeight
                    ? (userStats.currentWeight / userStats.goalWeight) * 100
                    : 100
                }
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 backdrop-blur-sm border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Weekly Progress
              </CardTitle>
              <Target className="h-4 w-4 text-pink-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                {userStats.completedWorkouts}/{userStats.weeklyGoal}
              </div>
              <p className="text-xs text-slate-400">Workouts this week</p>
              <Progress
                value={
                  (userStats.completedWorkouts / userStats.weeklyGoal) * 100
                }
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 backdrop-blur-sm border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Current Streak
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                {userStats.currentStreak}
              </div>
              <p className="text-xs text-slate-400">Days in a row</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 backdrop-blur-sm border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Total Workouts
              </CardTitle>
              <Trophy className="h-4 w-4 text-pink-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                {userStats.totalWorkouts}
              </div>
              <p className="text-xs text-slate-400">All time</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-slate-800/90 backdrop-blur-sm border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Plus className="w-5 h-5 text-cyan-400" />
                Add Exercise
              </CardTitle>
              <CardDescription className="text-slate-400">
                Build your custom workout by adding exercises with specific
                weights, reps, and sets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exercise-name" className="text-slate-200">
                  Exercise Name
                </Label>
                <Select
                  value={newExercise.name}
                  onValueChange={(value) =>
                    setNewExercise({ ...newExercise, name: value })
                  }
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200 data-[placeholder]:text-white">
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="bench-press" className="text-white">
                      Bench Press
                    </SelectItem>
                    <SelectItem value="squat" className="text-white">
                      Squat
                    </SelectItem>
                    <SelectItem value="deadlift" className="text-white">
                      Deadlift
                    </SelectItem>
                    <SelectItem value="overhead-press" className="text-white">
                      Overhead Press
                    </SelectItem>
                    <SelectItem value="barbell-row" className="text-white">
                      Barbell Row
                    </SelectItem>
                    <SelectItem value="pull-ups" className="text-white">
                      Pull-ups
                    </SelectItem>
                    <SelectItem value="dips" className="text-white">
                      Dips
                    </SelectItem>
                    <SelectItem value="bicep-curls" className="text-white">
                      Bicep Curls
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-slate-200">
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="60"
                    value={newExercise.weight}
                    onChange={(e) =>
                      setNewExercise({ ...newExercise, weight: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reps" className="text-slate-200">
                    Reps
                  </Label>
                  <Input
                    id="reps"
                    type="number"
                    placeholder="10"
                    value={newExercise.reps}
                    onChange={(e) =>
                      setNewExercise({ ...newExercise, reps: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sets" className="text-slate-200">
                    Sets
                  </Label>
                  <Input
                    id="sets"
                    type="number"
                    placeholder="3"
                    value={newExercise.sets}
                    onChange={(e) =>
                      setNewExercise({ ...newExercise, sets: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <Button
                onClick={addExercise}
                className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Workout
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 backdrop-blur-sm border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Dumbbell className="w-5 h-5 text-pink-400" />
                Current Workout
                {isWorkoutActive && (
                  <Badge className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white border-0 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    <Timer className="w-3 h-3 mr-1" />
                    ACTIVE
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Track your progress through each set and rep.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentWorkout.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No exercises added yet.</p>
                  <p className="text-sm">
                    Add exercises to start your workout!
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentWorkout.map((exercise) => (
                      <div key={exercise.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-200 capitalize">
                            {exercise.name.replace("-", " ")}
                          </h4>
                          <Badge
                            variant="outline"
                            className="text-xs border-slate-600 text-slate-300"
                          >
                            {exercise.sets.filter((s) => s.completed).length}/
                            {exercise.sets.length} sets
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {exercise.sets.map((set, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                                set.completed
                                  ? "bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                  : "bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 text-slate-300"
                              }`}
                              onClick={() => toggleSet(exercise.id, index)}
                            >
                              <span className="text-sm font-medium">
                                Set {index + 1}: {set.weight}kg × {set.reps}{" "}
                                reps
                              </span>
                              <div
                                className={`w-4 h-4 rounded-full border-2 ${
                                  set.completed
                                    ? "bg-gradient-to-r from-cyan-400 to-pink-400 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                                    : "border-slate-500"
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                        <Separator className="bg-slate-600" />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {!isWorkoutActive ? (
                      <Button
                        onClick={startWorkout}
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Workout
                      </Button>
                    ) : (
                      <Button
                        onClick={finishWorkout}
                        variant="outline"
                        className="flex-1 bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-700"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Finish Workout
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-700"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-16 text-left justify-start bg-slate-800/50 border-slate-600 hover:bg-slate-700/70 text-slate-200"
          >
            <Calendar className="w-5 h-5 mr-3 text-cyan-400" />
            <div>
              <div className="font-semibold">Schedule Workout</div>
              <div className="text-sm text-slate-400">
                Plan your next session
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-16 text-left justify-start bg-slate-800/50 border-slate-600 hover:bg-slate-700/70 text-slate-200"
          >
            <BarChart3 className="w-5 h-5 mr-3 text-pink-400" />
            <div>
              <div className="font-semibold">View Progress</div>
              <div className="text-sm text-slate-400">
                Track your improvements
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-16 text-left justify-start bg-slate-800/50 border-slate-600 hover:bg-slate-700/70 text-slate-200"
          >
            <Trophy className="w-5 h-5 mr-3 text-cyan-400" />
            <div>
              <div className="font-semibold">Achievements</div>
              <div className="text-sm text-slate-400">See your milestones</div>
            </div>
          </Button>
        </div>
      </div>

      <EditWeightDialog
        open={isEditWeightOpen}
        onOpenChange={setIsEditWeightOpen}
        currentWeight={userStats.currentWeight}
        goalWeight={userStats.goalWeight}
        onSave={handleSaveWeight}
      />

      <WeightHistoryDialog
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />
    </div>
  );
}
