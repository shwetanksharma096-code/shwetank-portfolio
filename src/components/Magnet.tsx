import React, { useState, useRef, useEffect } from 'react';

interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
}

export const Magnet: React.FC<MagnetProps> = ({
  children,
  padding = 150,
  strength = 3,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.6s ease-in-out"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("translate3d(0px, 0px, 0px)");
  const [transition, setTransition] = useState(inactiveTransition);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Calculate the center of the element
      const centerX = rect.left + width / 2;
      const centerY = rect.top + height / 2;

      // Mouse distance from the center
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      // Maximum distance to activate the magnet effect
      const activeDistance = Math.max(width, height) / 2 + padding;

      if (distance < activeDistance) {
        setTransition(activeTransition);
        // Strength divisor (smaller number = stronger pull)
        const x = distanceX / strength;
        const y = distanceY / strength;
        setTransform(`translate3d(${x}px, ${y}px, 0px)`);
      } else {
        setTransition(inactiveTransition);
        setTransform("translate3d(0px, 0px, 0px)");
      }
    };

    const handleMouseLeave = () => {
      setTransition(inactiveTransition);
      setTransform("translate3d(0px, 0px, 0px)");
    };

    const container = containerRef.current;
    window.addEventListener("mousemove", handleMouseMove);
    container?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      container?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [padding, strength, activeTransition, inactiveTransition]);

  return (
    <div
      ref={containerRef}
      style={{ transform, transition, willChange: 'transform' }}
      className="inline-block"
    >
      {children}
    </div>
  );
};
