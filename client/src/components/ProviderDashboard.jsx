import React, { useState } from 'react';
import CertificateUpload from './CertificateUpload';
import DataProcessing from './DataProcessing';
import DataChallenge from './DataChallenge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProviderDashboard() {
  const [currentStep, setCurrentStep] = useState(0);

  const components = [
    {
      component: CertificateUpload,
      props: { onNext: () => setCurrentStep(1) }
    },
    {
      component: DataProcessing,
      props: { 
        onNext: () => setCurrentStep(2),
        onPrev: () => setCurrentStep(0)
      }
    },
    {
      component: DataChallenge,
      props: { onPrev: () => setCurrentStep(1) }
    }
  ];

  const CurrentComponent = components[currentStep].component;
  const componentProps = components[currentStep].props;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-3xl mt-12 space-y-8 transition-all duration-300">
      <h2 className="text-3xl font-bold text-center text-gray-800">Provider Dashboard</h2>
      
      <CurrentComponent {...componentProps} />

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 0}
          className={`p-3 rounded-full bg-gray-200 transition-all duration-200 transform hover:scale-110 ${
            currentStep === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentStep(prev => prev + 1)}
          disabled={currentStep === components.length - 1}
          className={`p-3 rounded-full bg-gray-200 transition-all duration-200 transform hover:scale-110 ${
            currentStep === components.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}