"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dash } from "@/components/mascot";
import { 
  US_STATES, 
  DEFAULT_STATE, 
  LICENSE_TYPES 
} from "@/lib/constants/onboarding";
import { OnboardingData } from "@/types/database";
import { MapPin, User, Car, Calendar } from "lucide-react";

interface StepProfileProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onComplete: (data?: Partial<OnboardingData>) => void;
}

export function StepProfile({ data, onComplete }: StepProfileProps) {
  const shouldReduceMotion = useReducedMotion();
  const [formData, setFormData] = useState({
    displayName: typeof data.displayName === "string" ? data.displayName : "",
    age: typeof data.age === "number" || typeof data.age === "string" ? String(data.age) : "",
    state: typeof data.state === "string" ? data.state : DEFAULT_STATE,
    licenseType: typeof data.licenseType === "string" ? data.licenseType : "permit",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = "Please enter your name";
    }
    
    if (!formData.age) {
      newErrors.age = "Please enter your age";
    } else {
      const ageNum = parseInt(formData.age as string);
      if (isNaN(ageNum) || ageNum < 15 || ageNum > 100) {
        newErrors.age = "Age must be between 15 and 100";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const ageNum = parseInt(formData.age);

    onComplete({
      displayName: formData.displayName,
      age: ageNum,
      state: formData.state,
      licenseType: formData.licenseType,
    });
  };

  const labelClass = "flex items-center gap-2 text-sm font-semibold text-slate-800";
  const labelIconClass = "w-4 h-4 text-slate-500";
  const fieldClass =
    "h-12 border-slate-300 bg-white text-base text-slate-950 placeholder:text-slate-500 shadow-sm focus-visible:border-blue-500 focus-visible:ring-blue-500/30";
  const helperClass = "text-sm text-slate-600";

  return (
    <div className="space-y-7 text-slate-900">
      {/* Header with mascot */}
      <div className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
        <Dash emotion="happy" size="md" animate={true} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-blue-600">Tell me about you</p>
          <h2 className="text-xl font-bold text-slate-950">Your Profile</h2>
          <p className="text-sm text-slate-600">
            I&apos;ll tune your practice plan around your age, state, and goal.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : undefined}
        className="space-y-6"
      >
        {/* Name input */}
        <div className="space-y-2">
          <Label htmlFor="displayName" className={labelClass}>
            <User className={labelIconClass} />
            What should we call you?
          </Label>
          <Input
            id="displayName"
            placeholder="Enter your name"
            value={formData.displayName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, displayName: e.target.value })}
            className={`${fieldClass} ${errors.displayName ? "border-red-500 focus-visible:ring-red-500/30" : ""}`}
          />
          {errors.displayName && (
            <p className="text-sm text-red-500">{errors.displayName}</p>
          )}
        </div>

        {/* Age input */}
        <div className="space-y-2">
          <Label htmlFor="age" className={labelClass}>
            <Calendar className={labelIconClass} />
            How old are you?
          </Label>
          <Input
            id="age"
            type="number"
            placeholder="Enter your age"
            value={formData.age}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, age: e.target.value })}
            className={`${fieldClass} ${errors.age ? "border-red-500 focus-visible:ring-red-500/30" : ""}`}
            min={15}
            max={100}
          />
          {errors.age && (
            <p className="text-sm text-red-500">{errors.age}</p>
          )}
          <p className={helperClass}>
            You must be at least 15 years old to apply for a learner&apos;s permit in Illinois
          </p>
        </div>

        {/* State selection */}
        <div className="space-y-2">
          <Label htmlFor="state" className={labelClass}>
            <MapPin className={labelIconClass} />
            Which state are you in?
          </Label>
          <select
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {US_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
          <p className={helperClass}>
            Currently optimized for Illinois DMV tests. More states coming soon.
          </p>
        </div>

        {/* License type selection */}
        <div className="space-y-3">
          <Label className={labelClass}>
            <Car className={labelIconClass} />
            What are you studying for?
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {LICENSE_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setFormData({ ...formData, licenseType: type.value })}
                className={`
                  min-h-24 p-4 rounded-xl border-2 bg-white text-left transition-all
                  ${formData.licenseType === type.value
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }
                `}
              >
                <div className="font-semibold text-slate-950">{type.label}</div>
                <div className="mt-1 text-sm text-slate-600">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

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
