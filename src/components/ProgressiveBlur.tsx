import React from 'react';
import { cn } from '../lib/utils';

/**
 * ProgressiveBlur — Adds a gradient-blurred edge overlay to a section.
 * Adapted from Skiper UI (Skiper41) for React + Vite.
 *
 * Props:
 * - position: "top" | "bottom" — which edge to blur
 * - backgroundColor: The background color to fade into (hex/rgb/css)
 * - height: CSS height string (default "150px")
 * - blurAmount: CSS blur value (default "4px")
 * - className: Extra Tailwind classes
 */
export type ProgressiveBlurProps = {
  className?: string;
  backgroundColor?: string;
  position?: 'top' | 'bottom';
  height?: string;
  blurAmount?: string;
};

export const ProgressiveBlur: React.FC<ProgressiveBlurProps> = ({
  className = '',
  backgroundColor = '#FAF9F6',
  position = 'top',
  height = '150px',
  blurAmount = '4px',
}) => {
  const isTop = position === 'top';

  return (
    <div
      className={cn('pointer-events-none absolute left-0 w-full select-none z-10', className)}
      aria-hidden="true"
      style={{
        [isTop ? 'top' : 'bottom']: 0,
        height,
        background: isTop
          ? `linear-gradient(to top, transparent, ${backgroundColor})`
          : `linear-gradient(to bottom, transparent, ${backgroundColor})`,
        maskImage: isTop
          ? `linear-gradient(to bottom, ${backgroundColor} 50%, transparent)`
          : `linear-gradient(to top, ${backgroundColor} 50%, transparent)`,
        WebkitBackdropFilter: `blur(${blurAmount})`,
        backdropFilter: `blur(${blurAmount})`,
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    />
  );
};
