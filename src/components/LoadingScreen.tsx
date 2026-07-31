import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'badge' | 'fade'>('badge');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('fade');
      setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 350);
    }, 900);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={phase === 'fade' ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[99999] bg-[#FFFFFF] flex flex-col items-center justify-center pointer-events-none select-none font-sans px-4 border-b border-black/10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center gap-3"
          >
            <div className="w-16 h-16 rounded-full bg-[#FFE600] text-black font-extrabold text-2xl flex items-center justify-center shadow-lg border border-black/10 mb-1">
              SS
            </div>
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] px-4 py-1 rounded-full bg-black text-white">
              ASSOCIATE ACCOUNT MANAGER
            </span>
            <h1 className="font-extrabold text-4xl sm:text-7xl uppercase tracking-tight text-[#111111]">
              SHWETANK SHARMA
            </h1>
            <p className="text-xs font-mono font-bold text-black/60 uppercase tracking-widest mt-1 flex items-center gap-2">
              <span>2X E4M AWARD WINNER</span>
              <span>•</span>
              <span>Kalyan, Mumbai</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
