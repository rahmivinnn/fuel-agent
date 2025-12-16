import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div className="relative flex flex-col items-center">
            <div
              className={`flex items-center justify-center w-3 h-3 rounded-full transition-all duration-300 ${
                step === currentStep
                  ? "bg-primary scale-125"
                  : step < currentStep
                  ? "bg-primary"
                  : "bg-gray-300"
              }`}
            >
              {step < currentStep && (
                <Check className="w-2 h-2 text-white" />
              )}
            </div>
            {step === currentStep && (
              <img
                src="/Vector.png"
                alt="Car"
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-6 h-6 object-contain car-animated"
              />
            )}
          </div>
          {step < totalSteps && (
            <div
              className={`w-6 h-0.5 transition-all duration-300 ${
                step < currentStep ? "bg-primary" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}