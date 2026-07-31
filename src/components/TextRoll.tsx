import { motion } from 'framer-motion';
import React from 'react';
import { cn } from '../lib/utils';

const STAGGER = 0.035;

/**
 * TextRoll — Hover animation where letters roll up and new letters roll in from bottom.
 * Adapted from Skiper UI (Skiper58) for React + Vite (no "use client" directive needed).
 *
 * Props:
 * - children: The text string to animate
 * - className: Additional Tailwind classes
 * - center: If true, animation fans out from center letter (like the Skiper58 nav demo)
 */
export const TextRoll: React.FC<{
  children: string;
  className?: string;
  center?: boolean;
}> = ({ children, className, center = false }) => {
  return (
    <motion.span
      initial="initial"
      whileHover="hovered"
      className={cn('relative block overflow-hidden cursor-pointer', className)}
      style={{ lineHeight: 0.75 }}
    >
      {/* Top layer — slides UP on hover */}
      <div aria-hidden="true">
        {children.split('').map((l, i) => {
          const delay = center
            ? STAGGER * Math.abs(i - (children.length - 1) / 2)
            : STAGGER * i;
          return (
            <motion.span
              key={`top-${i}`}
              variants={{ initial: { y: 0 }, hovered: { y: '-100%' } }}
              transition={{ ease: 'easeInOut', delay }}
              className="inline-block"
            >
              {l === ' ' ? '\u00A0' : l}
            </motion.span>
          );
        })}
      </div>

      {/* Bottom layer — rises from below on hover */}
      <div className="absolute inset-0" aria-hidden="true">
        {children.split('').map((l, i) => {
          const delay = center
            ? STAGGER * Math.abs(i - (children.length - 1) / 2)
            : STAGGER * i;
          return (
            <motion.span
              key={`bot-${i}`}
              variants={{ initial: { y: '100%' }, hovered: { y: 0 } }}
              transition={{ ease: 'easeInOut', delay }}
              className="inline-block"
            >
              {l === ' ' ? '\u00A0' : l}
            </motion.span>
          );
        })}
      </div>

      {/* Visible label for accessibility */}
      <span className="sr-only">{children}</span>
    </motion.span>
  );
};
