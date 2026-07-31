import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface TiltPanelProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export const TiltPanel: React.FC<TiltPanelProps> = ({ children, className = '', intensity = 12 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const rY = ((mouseX / width) - 0.5) * intensity;
    const rX = ((mouseY / height) - 0.5) * -intensity;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className="perspective-1000 w-full">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX, rotateY }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`preserve-3d transition-shadow duration-300 ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
};
