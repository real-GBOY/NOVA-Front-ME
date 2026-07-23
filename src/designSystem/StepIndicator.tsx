/** @format */

import { ArrowRightSLine } from "@/Icons";
import { useLanguage } from "@/hooks/useLanguage";

export type Step = {
   id: number;
   title: string;
   key: string;
};

type StepIndicatorProps = {
   steps: readonly Step[];
   currentStep: number;
   onStepChange?: (stepId: number) => void;
   className?: string;
   disableHoverEffects?: boolean;
};

function StepIndicator({
   steps,
   currentStep,
   onStepChange,
   className = "",
   disableHoverEffects = false,
}: StepIndicatorProps) {
   const { isRTL } = useLanguage();

   return (
      <div
         className={`bg-background rounded-xl sm:rounded-2xl p-2 sm:p-4 flex flex-col gap-1.5 sm:gap-3 shadow-sm ${className}`}>
         {steps.map((step) => {
            const isActive = step.id === currentStep;

            return (
               <button
                  key={step.id}
                  onClick={() => onStepChange?.(step.id)}
                  disabled={!onStepChange}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl text-start transition-all shrink-0
                     ${
                        isActive
                           ? "bg-bg-weak"
                           : disableHoverEffects
                           ? "bg-transparent"
                           : "bg-transparent hover:bg-bg-weak/50"
                     }
                     ${!onStepChange ? "cursor-default" : "cursor-pointer"}`}>
                  {/* Step Indicator Circle */}
                  <div
                     className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                        isActive
                           ? "bg-primary text-text-main"
                           : "bg-border text-text-sub"
                     }`}>
                     {step.id}
                  </div>

                  {/* Step Title */}
                  <span className="text-[11px] sm:text-sm font-medium flex-1 text-text-strong whitespace-nowrap">
                     {step.title}
                  </span>

                  {/* Arrow Icon (only for active step) */}
                  {isActive && (
                     <div className="text-text-sub shrink-0">
                        <ArrowRightSLine size={18} isRTL={isRTL} />
                     </div>
                  )}
               </button>
            );
         })}
      </div>
   );
}

export default StepIndicator;
