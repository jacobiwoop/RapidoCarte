import React, { useEffect, useState } from 'react';
import { ANALYSIS_STEPS, ANIMATION_DURATION_MS } from '../constants';
import { motion } from 'framer-motion';
import { ShieldCheck, Server, Lock } from 'lucide-react';

interface AnalysisViewProps {
  onComplete: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const totalSteps = ANALYSIS_STEPS.length;
    
    // Interval for smooth progress bar updates
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / ANIMATION_DURATION_MS) * 100, 100);
      
      setProgress(newProgress);

      // Calculate which text step we should be on based on time elapsed
      const stepDuration = ANIMATION_DURATION_MS / totalSteps;
      const stepIndex = Math.min(
        Math.floor(elapsed / stepDuration),
        totalSteps - 1
      );
      
      setCurrentStepIndex(stepIndex);

      if (elapsed >= ANIMATION_DURATION_MS) {
        clearInterval(progressInterval);
        setTimeout(onComplete, 500); // Small delay at 100% before switching
      }
    }, 50); // Update every 50ms for smoothness

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  return (
    <div className="w-full max-w-lg text-center space-y-12">
      
      {/* Central Animation */}
      <div className="relative flex items-center justify-center py-8">
        {/* Background pulses */}
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse blur-3xl opacity-50" />
        
        {/* Spinner Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="relative w-40 h-40 rounded-full border border-slate-200 shadow-xl bg-white/50 backdrop-blur-sm"
        >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 border-t-4 border-r-4 border-transparent rounded-full border-t-blue-600 border-r-blue-400" />
        </motion.div>
        
        {/* Inner Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center">
                <Server className="w-10 h-10 text-blue-600" />
            </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
           <h3 className="text-2xl font-bold text-slate-900 mb-2">Vérification Sécurisée</h3>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
              <Lock className="w-3 h-3" />
              Connexion SSL chiffrée
           </div>
        </div>
        
        {/* Progress Bar Container */}
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Progression</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-blue-600"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>

        {/* Dynamic Step Text */}
        <div className="min-h-[60px] flex items-center justify-center">
            <motion.p
                key={currentStepIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-slate-600 font-medium flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-100"
            >
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                {ANALYSIS_STEPS[currentStepIndex]}
            </motion.p>
        </div>
      </div>
    </div>
  );
};