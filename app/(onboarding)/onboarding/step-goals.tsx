"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dash } from "@/components/mascot";
import { 
  STUDY_TIME_OPTIONS, 
  TARGET_SCORE_OPTIONS 
} from "@/lib/constants/onboarding";
import { OnboardingData } from "@/types/database";
import { Clock, Target, Calendar } from "lucide-react";

interface StepGoalsProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onComplete: (data?: Partial<OnboardingData>) => void;
}

export function StepGoals({ data, updateData, onComplete }: StepGoalsProps) {
  const shouldReduceMotion = useReducedMotion();
  const [today] = useState(() => new Date());
  const todayTime = today.getTime();
  const todayIso = today.toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    testDate: data.testDate || "",
    dailyStudyTime: data.dailyGoal || 20,
    targetScore: typeof data.targetScore === "number" ? data.targetScore : 85,
  });

  const labelClass = "flex items-center gap-2 text-sm font-semibold text-slate-800";
  const labelIconClass = "w-4 h-4 text-slate-500";
  const helperClass = "text-sm text-slate-600";
  const choiceClass = "min-h-20 rounded-xl border-2 bg-white p-3 text-left transition-all";

  const handleSubmit = () => {
    updateData({
      testDate: formData.testDate || undefined,
      dailyGoal: formData.dailyStudyTime,
      targetScore: formData.targetScore,
    });

    onComplete({
      testDate: formData.testDate || undefined,
      dailyGoal: formData.dailyStudyTime,
      targetScore: formData.targetScore,
    });
  };

  // Calculate recommended study plan
  const getStudyPlan = () => {
    const weeksUntilTest = formData.testDate 
      ? Math.ceil((new Date(formData.testDate).getTime() - todayTime) / (1000 * 60 * 60 * 24 * 7))
      : null;
    
    if (weeksUntilTest && weeksUntilTest > 0) {
      const totalMinutes = weeksUntilTest * 7 * formData.dailyStudyTime;
      const totalHours = Math.round(totalMinutes / 60);
      return `With ${formData.dailyStudyTime} min/day, you'll study ${totalHours} hours before your test.`;
    }
    return `Studying ${formData.dailyStudyTime} minutes daily will help you reach your goal.`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
        <Dash emotion="thinking" size="md" animate={!shouldReduceMotion} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-blue-600">Set your goals</p>
          <h2 className="text-xl font-bold text-slate-950">Build your study rhythm</h2>
          <p className="text-sm text-slate-600">
            Pick a plan you can actually keep. Tiny reps still count.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : undefined}
        className="space-y-6"
      >
        {/* Test date */}
        <div className="space-y-2">
          <Label htmlFor="testDate" className={labelClass}>
            <Calendar className={labelIconClass} />
            When is your test? (Optional)
          </Label>
          <input
            id="testDate"
            type="date"
            value={formData.testDate}
            onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
            className="h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            min={todayIso}
          />
          <p className={helperClass}>
            Don&apos;t have a date yet? No problem. You can set one later.
          </p>
        </div>

        {/* Daily study time */}
        <div className="space-y-3">
          <Label className={labelClass}>
            <Clock className={labelIconClass} />
            How much time can you study daily?
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STUDY_TIME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, dailyStudyTime: option.value })}
                className={`
                  ${choiceClass}
                  ${formData.dailyStudyTime === option.value
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }
                `}
              >
                <div className="font-semibold text-slate-950">{option.label}</div>
                <div className="text-sm text-slate-600">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Target score */}
        <div className="space-y-3">
          <Label className={labelClass}>
            <Target className={labelIconClass} />
            What&apos;s your target score?
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TARGET_SCORE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, targetScore: option.value })}
                className={`
                  ${choiceClass}
                  ${formData.targetScore === option.value
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }
                `}
              >
                <div className="font-semibold text-slate-950">{option.label}</div>
                <div className="text-sm text-slate-600">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Study plan summary */}
        <motion.div
          key={`${formData.testDate}-${formData.dailyStudyTime}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className="p-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl border border-blue-100"
        >
          <p className="text-sm text-blue-800 font-medium">Your Study Plan</p>
          <p className="text-sm text-blue-600 mt-1">{getStudyPlan()}</p>
        </motion.div>

        {/* Submit button */}
        <Button
          size="lg"
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600"
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
