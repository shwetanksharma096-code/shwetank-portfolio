import React, { useEffect, useRef } from 'react';

interface ConfettiEffectProps {
  trigger: boolean;
  onDone?: () => void;
}

const COLORS = ['#818cf8', '#BBCCD7', '#34d399', '#f472b6', '#fbbf24', '#e0e7ff', '#a5f3fc'];

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ trigger, onDone }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !containerRef.current) return;
    const container = containerRef.current;

    const particles: HTMLSpanElement[] = [];

    for (let i = 0; i < 36; i++) {
      const el = document.createElement('span');
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size = Math.random() * 7 + 4;
      const angle = (i / 36) * 360 + Math.random() * 20;
      const distance = Math.random() * 130 + 60;
      const duration = Math.random() * 600 + 700;
      const dx = Math.cos((angle * Math.PI) / 180) * distance;
      const dy = Math.sin((angle * Math.PI) / 180) * distance;
      const isCircle = Math.random() > 0.4;

      el.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${isCircle ? '50%' : '2px'};
        left: 50%;
        top: 50%;
        pointer-events: none;
        transform: translate(-50%, -50%);
        animation: confetti-burst ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        --dx: ${dx}px;
        --dy: ${dy}px;
        --rot: ${Math.random() * 360}deg;
        box-shadow: 0 0 4px ${color}88;
      `;

      container.appendChild(el);
      particles.push(el);
    }

    const cleanup = setTimeout(() => {
      particles.forEach((p) => p.remove());
      onDone?.();
    }, 1500);

    return () => {
      clearTimeout(cleanup);
      particles.forEach((p) => p.remove());
    };
  }, [trigger, onDone]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-50 overflow-visible"
      aria-hidden="true"
    />
  );
};
