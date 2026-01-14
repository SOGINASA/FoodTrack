import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { useOnboardingDraft } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../hooks/useOnboarding';

import OnboardingShell from '../components/onboarding/OnboardingShell';

import StepGender from '../components/onboarding/steps/StepGender';
import StepWorkouts from '../components/onboarding/steps/StepWorkouts';
import StepDiet from '../components/onboarding/steps/StepDiet';
import StepBirthYear from '../components/onboarding/steps/StepBirthYear';
import StepBodyGoal from '../components/onboarding/steps/StepBodyGoal';
import StepMealsPerDay from '../components/onboarding/steps/StepMealsPerDay';
import StepHealth from '../components/onboarding/steps/StepHealth';
import StepDisclaimer from '../components/onboarding/steps/StepDisclaimer';

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

const transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.22,
};

const steps = [
  StepGender,
  StepWorkouts,
  StepDiet,
  StepBirthYear,
  StepBodyGoal,
  StepMealsPerDay,
  StepHealth,
  StepDisclaimer,
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { draft } = useOnboardingDraft();
  const { completeOnboarding } = useAuth();

  const {
    step,
    direction,
    error,
    setError,
    progress,
    next,
    back,
    totalSteps,
  } = useOnboarding(draft);

  const CurrentStep = steps[step];

  const onContinue = () => {
    setError('');

    const ok = next();
    if (!ok) return;

    // если это был последний шаг — завершаем онбординг
    if (step === totalSteps - 1) {
      completeOnboarding();
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      {/* На десктопе ограничиваем ширину, на мобилке тянется */}
      <div className="w-full max-w-md">
        <OnboardingShell
          stepNumber={progress.stepNumber}
          totalSteps={progress.totalSteps}
          onBack={step === 0 ? null : back}
          onContinue={onContinue}
          error={error}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={progress.key}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              <CurrentStep />
            </motion.div>
          </AnimatePresence>
        </OnboardingShell>
      </div>
    </div>
  );
}
