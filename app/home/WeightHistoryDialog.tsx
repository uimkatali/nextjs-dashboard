"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Weight, Target } from "lucide-react";
import { format } from "date-fns";

interface WeightHistoryEntry {
  id: number;
  weightType: "current_weight" | "goal_weight";
  oldValue: number | null;
  newValue: number;
  changedAt: string;
}

interface WeightHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WeightHistoryDialog({
  open,
  onOpenChange,
}: WeightHistoryDialogProps) {
  const [history, setHistory] = useState<WeightHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/user/weight-history");
      const data = await response.json();

      if (data.success) {
        setHistory(data.data);
      } else {
        setError("Failed to load weight history");
      }
    } catch (err) {
      setError("Failed to load weight history");
      console.error("History fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return dateString;
    }
  };

  const getWeightTypeLabel = (type: string) => {
    return type === "current_weight" ? "Current Weight" : "Goal Weight";
  };

  const getWeightTypeIcon = (type: string) => {
    return type === "current_weight" ? (
      <Weight className="h-4 w-4" />
    ) : (
      <Target className="h-4 w-4" />
    );
  };

  const getChangeDisplay = (oldValue: number | null, newValue: number) => {
    if (oldValue === null) {
      return `Set to ${newValue}kg`;
    }
    const diff = newValue - oldValue;
    const sign = diff > 0 ? "+" : "";
    return `${oldValue}kg → ${newValue}kg (${sign}${diff.toFixed(1)}kg)`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-cyan-500/30 text-white sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <History className="h-5 w-5 text-cyan-400" />
            Weight History
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Track all changes to your current weight and goal weight over time.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No weight history yet.</p>
              <p className="text-sm mt-2">
                Start tracking by editing your weight!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-700/70 transition-colors"
                >
                  <div className="mt-0.5 text-cyan-400">
                    {getWeightTypeIcon(entry.weightType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200">
                        {getWeightTypeLabel(entry.weightType)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(entry.changedAt)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-300">
                      {getChangeDisplay(entry.oldValue, entry.newValue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
