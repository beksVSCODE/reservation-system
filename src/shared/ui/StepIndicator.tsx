import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: string;
  completedSteps: string[];
  onStepClick?: (stepId: string) => void;
}

export const StepIndicator = ({ steps, currentStep, completedSteps, onStepClick }: StepIndicatorProps) => {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = step.id === currentStep;
        const isPast = index < currentIndex;
        const canClick = isPast || isCompleted;

        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => canClick && onStepClick?.(step.id)}
              disabled={!canClick}
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all',
                isCurrent && 'booking-step-active shadow-md',
                isCompleted && !isCurrent && 'booking-step-completed',
                !isCurrent && !isCompleted && 'booking-step-pending',
                canClick && 'cursor-pointer hover:opacity-80',
                !canClick && 'cursor-default'
              )}
            >
              <span className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                isCurrent && 'bg-primary-foreground/20',
                isCompleted && !isCurrent && 'bg-success-foreground/20',
                !isCurrent && !isCompleted && 'bg-muted-foreground/20'
              )}>
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span className="hidden md:inline">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <div className={cn(
                'mx-2 h-0.5 w-8 md:w-12 transition-colors',
                isPast || isCompleted ? 'bg-success' : 'bg-border'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
};
