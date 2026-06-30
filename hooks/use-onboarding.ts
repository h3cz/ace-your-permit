"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { OnboardingData, Json } from "@/types/database";
import { ONBOARDING_STEPS } from "@/lib/constants/onboarding";

interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  data: OnboardingData;
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;
}

interface UseOnboardingReturn extends OnboardingState {
  // Navigation
  goToStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  
  // Actions
  completeStep: (stepData?: Partial<OnboardingData>) => Promise<void>;
  skipStep: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  
  // Data
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  
  // Progress
  totalSteps: number;
  progressPercentage: number;
  currentStepData: typeof ONBOARDING_STEPS[number];
  xpEarned: number;
  xpForCurrentStep: number;
}

const defaultOnboardingData: OnboardingData = {
  stepsCompleted: [],
  stepsSkipped: [],
};

export function useOnboarding(): UseOnboardingReturn {
  const supabase = createClient();
  
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    completedSteps: [],
    skippedSteps: [],
    data: defaultOnboardingData,
    isLoading: true,
    error: null,
    isCompleted: false,
  });

  // Load onboarding state from Supabase
  useEffect(() => {
    async function loadOnboardingState() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setState(prev => ({ ...prev, isLoading: false, error: "Not authenticated" }));
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("onboarding_completed, onboarding_step, onboarding_data")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (profile) {
          const onboardingData = (profile.onboarding_data as unknown as OnboardingData) || defaultOnboardingData;
          setState(prev => ({
            ...prev,
            currentStep: profile.onboarding_step || 0,
            completedSteps: onboardingData.stepsCompleted || [],
            skippedSteps: onboardingData.stepsSkipped || [],
            data: onboardingData,
            isCompleted: profile.onboarding_completed || false,
            isLoading: false,
          }));
        }
      } catch (err) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load onboarding state",
        }));
      }
    }

    loadOnboardingState();
  }, [supabase]);

  // Save onboarding state to Supabase
  const saveOnboardingState = useCallback(async (
    updates: Partial<OnboardingState>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const newData: OnboardingData = {
        ...state.data,
        ...updates.data,
        stepsCompleted: updates.completedSteps || state.completedSteps,
        stepsSkipped: updates.skippedSteps || state.skippedSteps,
      };

      const { error } = await supabase
        .from("profiles")
        .update({
          onboarding_step: updates.currentStep ?? state.currentStep,
          onboarding_completed: updates.isCompleted ?? state.isCompleted,
          onboarding_data: newData as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to save onboarding state",
      }));
      throw err;
    }
  }, [supabase, state.data, state.currentStep, state.isCompleted, state.completedSteps, state.skippedSteps]);

  // Navigation
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < ONBOARDING_STEPS.length) {
      setState(prev => ({ ...prev, currentStep: step }));
    }
  }, []);

  const goToNextStep = useCallback(() => {
    setState(prev => {
      const nextStep = Math.min(prev.currentStep + 1, ONBOARDING_STEPS.length - 1);
      return { ...prev, currentStep: nextStep };
    });
  }, []);

  const goToPreviousStep = useCallback(() => {
    setState(prev => {
      const prevStep = Math.max(prev.currentStep - 1, 0);
      return { ...prev, currentStep: prevStep };
    });
  }, []);

  // Award XP to user
  const awardXP = useCallback(async (amount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (amount > 0) {
        const { error } = await supabase.rpc("increment_total_xp", {
          user_id: user.id,
          xp_amount: amount,
        });

        if (error) {
          console.error("Failed to increment onboarding XP:", error);
        }
      }
    } catch (err) {
      console.error("Failed to award XP:", err);
    }
  }, [supabase]);

  // Complete current step
  const completeStep = useCallback(async (stepData?: Partial<OnboardingData>) => {
    const currentStepIndex = state.currentStep;
    const wasAlreadyCompleted = state.completedSteps.includes(currentStepIndex);
    
    setState(prev => {
      const newCompletedSteps = [...new Set([...prev.completedSteps, currentStepIndex])];
      const newSkippedSteps = prev.skippedSteps.filter(s => s !== currentStepIndex);
      const newData = { ...prev.data, ...stepData };
      
      const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;
      const nextStep = isLastStep ? currentStepIndex : currentStepIndex + 1;
      
      return {
        ...prev,
        currentStep: nextStep,
        completedSteps: newCompletedSteps,
        skippedSteps: newSkippedSteps,
        data: newData,
        isCompleted: isLastStep || prev.isCompleted,
      };
    });

    // Save to Supabase
    await saveOnboardingState({
      currentStep: currentStepIndex === ONBOARDING_STEPS.length - 1 ? currentStepIndex : currentStepIndex + 1,
      completedSteps: [...new Set([...state.completedSteps, currentStepIndex])],
      skippedSteps: state.skippedSteps.filter(s => s !== currentStepIndex),
      data: { ...state.data, ...stepData },
      isCompleted: currentStepIndex === ONBOARDING_STEPS.length - 1 || state.isCompleted,
    });

    // Award XP once per step. This keeps remounts/double taps from stacking XP.
    if (!wasAlreadyCompleted) {
      await awardXP(ONBOARDING_STEPS[currentStepIndex].xpReward);
    }
  }, [state.currentStep, state.completedSteps, state.skippedSteps, state.data, state.isCompleted, saveOnboardingState, awardXP]);

  // Skip current step
  const skipStep = useCallback(async () => {
    const currentStepIndex = state.currentStep;
    
    setState(prev => {
      const newSkippedSteps = [...new Set([...prev.skippedSteps, currentStepIndex])];
      const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;
      const nextStep = isLastStep ? currentStepIndex : currentStepIndex + 1;
      
      return {
        ...prev,
        currentStep: nextStep,
        skippedSteps: newSkippedSteps,
        isCompleted: isLastStep || prev.isCompleted,
      };
    });

    await saveOnboardingState({
      currentStep: currentStepIndex === ONBOARDING_STEPS.length - 1 ? currentStepIndex : currentStepIndex + 1,
      skippedSteps: [...new Set([...state.skippedSteps, currentStepIndex])],
      isCompleted: currentStepIndex === ONBOARDING_STEPS.length - 1 || state.isCompleted,
    });
  }, [state.currentStep, state.skippedSteps, state.isCompleted, saveOnboardingState]);

  // Reset onboarding
  const resetOnboarding = useCallback(async () => {
    setState({
      currentStep: 0,
      completedSteps: [],
      skippedSteps: [],
      data: defaultOnboardingData,
      isLoading: false,
      error: null,
      isCompleted: false,
    });

    await saveOnboardingState({
      currentStep: 0,
      completedSteps: [],
      skippedSteps: [],
      data: defaultOnboardingData,
      isCompleted: false,
    });
  }, [saveOnboardingState]);

  // Update onboarding data locally
  const updateOnboardingData = useCallback((data: Partial<OnboardingData>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...data },
    }));
  }, []);

  // Calculate progress
  const progressPercentage = Math.round(
    (state.completedSteps.length / ONBOARDING_STEPS.length) * 100
  );

  // Calculate XP earned
  const xpEarned = state.completedSteps.reduce((sum, stepIndex) => {
    return sum + ONBOARDING_STEPS[stepIndex].xpReward;
  }, 0);

  return {
    ...state,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    completeStep,
    skipStep,
    resetOnboarding,
    updateOnboardingData,
    totalSteps: ONBOARDING_STEPS.length,
    progressPercentage,
    currentStepData: ONBOARDING_STEPS[state.currentStep],
    xpEarned,
    xpForCurrentStep: ONBOARDING_STEPS[state.currentStep]?.xpReward || 0,
  };
}

// Hook to check if user needs onboarding
export function useOnboardingStatus() {
  const [status, setStatus] = useState<{
    needsOnboarding: boolean;
    isLoading: boolean;
    error: string | null;
  }>({
    needsOnboarding: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function checkStatus() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setStatus({ needsOnboarding: false, isLoading: false, error: null });
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setStatus({
          needsOnboarding: !profile?.onboarding_completed,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setStatus({
          needsOnboarding: false,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to check onboarding status",
        });
      }
    }

    checkStatus();
  }, []);

  return status;
}
