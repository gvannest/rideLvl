import { useState, useEffect } from 'react';

const LoadingCard = ({ videoName, startTime }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: "Uploading video", icon: "⬆️" },
    { label: "Analyzing skiing technique", icon: "🎿" },
    { label: "Detecting pose landmarks", icon: "🔍" },
    { label: "Calculating metrics", icon: "📊" },
    { label: "Generating feedback", icon: "✨" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const totalDuration = 7500; // Average of 6-9 seconds
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      // Update current step based on progress
      const stepIndex = Math.floor((newProgress / 100) * steps.length);
      setCurrentStep(Math.min(stepIndex, steps.length - 1));
    }, 100);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce">🎿</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Processing: {videoName}
          </h3>
          <p className="text-sm text-gray-600">
            Analyzing your skiing technique with AI
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-bright-blue to-bright-orange h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={index}
                className={`flex items-center space-x-3 transition-all duration-300 ${
                  isActive ? 'scale-105' : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-punchy-green text-white'
                      : isActive
                      ? 'bg-bright-blue text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : step.icon}
                </div>
                <span
                  className={`text-sm transition-all duration-300 ${
                    isActive
                      ? 'text-gray-900 font-semibold'
                      : isCompleted
                      ? 'text-gray-700'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                  {isActive && (
                    <span className="ml-2 inline-block">
                      <span className="animate-pulse">...</span>
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>This may take a few moments for accurate analysis</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingCard;