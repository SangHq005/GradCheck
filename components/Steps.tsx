import React from 'react';
import { AppState } from '../types';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

interface StepsProps {
  currentStep: AppState;
}

const steps = [
  { id: AppState.IDLE, label: 'Bắt đầu' },
  { id: AppState.UPLOADING_CLUB, label: 'DS Thành viên' },
  { id: AppState.UPLOADING_SCHOOL, label: 'DS Trường' },
  { id: AppState.RESULTS, label: 'Kết quả' },
];

export const Steps: React.FC<StepsProps> = ({ currentStep }) => {
  const getStepIndex = (state: AppState) => {
    if (state === AppState.PROCESSING) return 3;
    return steps.findIndex(s => s.id === state);
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="w-full py-6 px-4 mb-8">
      <div className="flex items-center justify-center w-full max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {index > 0 && (
              <div className={`h-1 w-10 sm:w-24 mx-2 ${index <= currentIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
            <div className="flex flex-col items-center">
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                ${index < currentIndex ? 'bg-blue-600 border-blue-600 text-white' : 
                  index === currentIndex ? 'border-blue-600 text-blue-600 bg-white' : 'border-gray-300 text-gray-300 bg-white'}`}
              >
                {index < currentIndex ? <CheckCircle size={16} /> : <span className="text-sm font-bold">{index + 1}</span>}
              </div>
              <span className={`mt-2 text-xs sm:text-sm font-medium ${index === currentIndex ? 'text-blue-700' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};