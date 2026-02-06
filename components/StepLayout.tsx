import React from 'react';
import { motion } from 'framer-motion';

interface StepLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export const StepLayout: React.FC<StepLayoutProps> = ({ 
  children, 
  className = '', 
  maxWidth = 'max-w-4xl' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`w-full ${maxWidth} mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh] ${className}`}
    >
      {children}
    </motion.div>
  );
};