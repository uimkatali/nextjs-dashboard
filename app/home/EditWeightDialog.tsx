"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Weight } from "lucide-react";

interface EditWeightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWeight: number;
  goalWeight: number;
  onSave: (currentWeight: number, goalWeight: number) => Promise<void>;
}

export default function EditWeightDialog({
  open,
  onOpenChange,
  currentWeight,
  goalWeight,
  onSave,
}: EditWeightDialogProps) {
  const [localCurrentWeight, setLocalCurrentWeight] = useState(
    currentWeight.toString()
  );
  const [localGoalWeight, setLocalGoalWeight] = useState(goalWeight.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local state when props change
  useEffect(() => {
    setLocalCurrentWeight(currentWeight.toString());
    setLocalGoalWeight(goalWeight.toString());
  }, [currentWeight, goalWeight, open]);

  const handleSave = async () => {
    setError(null);

    const current = parseFloat(localCurrentWeight);
    const goal = parseFloat(localGoalWeight);

    // Validation
    if (isNaN(current) || current <= 0) {
      setError("Current weight must be a positive number");
      return;
    }

    if (isNaN(goal) || goal <= 0) {
      setError("Goal weight must be a positive number");
      return;
    }

    if (current > 500 || goal > 500) {
      setError("Weight values seem unrealistic. Please check your input.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(current, goal);
      onOpenChange(false);
    } catch (err) {
      setError("Failed to save weight. Please try again.");
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-cyan-500/30 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <Weight className="h-5 w-5 text-cyan-400" />
            Edit Weight Goals
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Update your current weight and goal weight. Changes will be tracked
            in your history.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="current-weight" className="text-slate-200">
              Current Weight (kg)
            </Label>
            <Input
              id="current-weight"
              type="number"
              step="0.1"
              min="0"
              value={localCurrentWeight}
              onChange={(e) => setLocalCurrentWeight(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              placeholder="70.0"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="goal-weight" className="text-slate-200">
              Goal Weight (kg)
            </Label>
            <Input
              id="goal-weight"
              type="number"
              step="0.1"
              min="0"
              value={localGoalWeight}
              onChange={(e) => setLocalGoalWeight(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              placeholder="75.0"
            />
          </div>
          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-md p-2">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-700"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
