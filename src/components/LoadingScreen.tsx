import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

const MESSAGES = [
  "Analyzing room geometry...",
  "Consulting with the designer...",
  "Selecting color palettes...",
  "Sourcing materials and textures...",
  "Rendering new lighting...",
  "Finalizing design plan..."
];

export const LoadingScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f9f8f6]">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="relative w-24 h-24 mb-12">
          <motion.div
            className="absolute inset-0 border-4 border-[#e0dcd8] rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          <motion.div
            className="absolute inset-0 border-4 border-t-[#8c7a6b] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        <h2 className="text-3xl font-serif mb-4 text-[#1a1a1a]">Crafting Your Space</h2>
        
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-gray-500 text-lg tracking-wide"
        >
          {MESSAGES[messageIndex]}
        </motion.p>
      </div>
    </div>
  );
};
