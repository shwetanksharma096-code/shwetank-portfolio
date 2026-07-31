import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[9997] origin-left pointer-events-none"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #818cf8, #BBCCD7, #818cf8)',
        boxShadow: '0 0 8px rgba(187,204,215,0.6)',
      }}
    />
  );
};
