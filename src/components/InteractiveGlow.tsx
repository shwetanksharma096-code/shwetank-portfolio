import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const InteractiveGlow: React.FC = () => {
  const [opacity, setOpacity] = useState(0);
  const [isMobile, setIsMobile] = useState(true);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for cursor-following spotlight
  const springX = useSpring(mouseX, { stiffness: 45, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 30 });

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsMobile(isTouch);
    if (isTouch) return;

    let opacitySet = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!opacitySet) {
        setOpacity(1);
        opacitySet = true;
      }
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseLeave = () => {
      setOpacity(0);
      opacitySet = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* 1. Extremely subtle, premium GPU-composited cursor spotlight */}
      {!isMobile && (
        <motion.div
          className="fixed pointer-events-none z-[2] w-[500px] h-[500px] rounded-full"
          style={{
            x: springX,
            y: springY,
            translateX: '-50%',
            translateY: '-50%',
            background: 'radial-gradient(circle, rgba(120, 119, 198, 0.07) 0%, rgba(120, 119, 198, 0) 75%)',
            opacity,
            willChange: 'transform, opacity',
          }}
        />
      )}
      
      {/* 2. Drifting static ambient mesh glows (No distracting cursor follower blobs) */}
      <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden select-none opacity-30">
        {/* Blob 1: Violet/Indigo (Slow Drift) */}
        <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/10 blur-[130px] animate-blob-slow" />
        
        {/* Blob 2: Cyan (Slow Drift) */}
        <div className="absolute bottom-[-20%] right-[-20%] w-[65vw] h-[65vw] rounded-full bg-cyan-500/10 blur-[140px] animate-blob-reverse" />
      </div>
    </>
  );
};
