import { motion, useScroll, useTransform } from 'framer-motion';
import React, { useRef } from 'react';
import { cn } from '../lib/utils';

/**
 * ScrollStrokePath — An SVG path whose stroke draws itself as the user scrolls.
 * Adapted from Skiper UI (Skiper19) for React + Vite.
 *
 * Wrap a tall section with `ref` and pass `scrollYProgress` from framer-motion's useScroll.
 * Or use the self-contained <ScrollStrokeSection> wrapper below.
 */

interface ScrollStrokePathProps {
  className?: string;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  color?: string;
  strokeWidth?: number;
}

export const ScrollStrokePath: React.FC<ScrollStrokePathProps> = ({
  className = '',
  scrollYProgress,
  color = '#7621B0',
  strokeWidth = 6,
}) => {
  const pathLength = useTransform(scrollYProgress, [0, 0.85], [0, 1]);

  return (
    <svg
      width="600"
      height="1200"
      viewBox="0 0 600 1200"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('pointer-events-none', className)}
    >
      <motion.path
        d="
          M300 0
          C300 0 450 80 500 200
          C550 320 520 420 400 480
          C280 540 160 500 120 400
          C80 300 120 180 220 140
          C320 100 420 160 440 260
          C460 360 380 460 280 500
          C180 540 80 500 60 400
          C40 300 100 180 200 160
          C300 140 380 220 400 320
          C420 420 360 520 260 560
          C160 600 80 560 80 480
          C80 400 160 320 260 320
          C360 320 440 400 440 480
          C440 560 380 640 300 680
          C220 720 140 700 120 640
          C100 580 140 520 200 500
          C260 480 320 520 340 580
          C360 640 340 720 300 760
          C260 800 200 820 160 800
          C120 780 100 740 120 700
          C140 660 180 640 220 660
          C260 680 280 720 260 760
          C240 800 200 820 180 800
          C160 780 160 740 200 720
          C240 700 300 720 320 760
          C340 800 320 860 300 900
          C280 940 260 980 300 1000
          C340 1020 380 1000 400 960
          C420 920 410 880 390 860
          C370 840 340 840 320 860
          C300 880 300 920 320 940
          C340 960 370 960 390 940
          C410 920 420 900 400 880
          C380 860 350 860 340 900
          C330 940 350 980 380 1000
          C410 1020 440 1010 460 990
          C480 970 480 940 460 920
          C440 900 400 900 380 930
          C360 960 380 1000 400 1020
          C420 1040 450 1050 480 1040
          C510 1030 540 1010 560 980
          C580 950 590 920 580 900
          C570 880 550 870 530 880
          C510 890 500 910 510 930
          C520 950 540 960 560 950
          C580 940 590 920 580 900
          C570 880 550 870 530 880
          C510 890 500 920 520 940
          C540 960 580 960 600 940
          C620 920 620 890 600 880
          C580 870 560 880 550 900
          C540 920 550 950 570 960
          C590 970 610 960 620 940
          C630 920 630 900 620 890
          C610 880 600 880 600 900
          C600 920 620 940 640 940
          C660 940 680 920 680 900
          C680 880 660 860 640 860
          C620 860 600 880 600 900
          C600 920 620 940 640 940
          C660 940 680 920 680 900
          C680 880 660 860 640 860
          C620 860 600 880 600 900
          C600 920 620 940 640 940
          C660 940 680 920 680 900
          C680 880 660 860 640 860
        "
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        style={{ pathLength }}
      />
    </svg>
  );
};

/**
 * Self-contained wrapper that tracks its own scroll progress.
 * Drop it inside any section as a decorative background element.
 */
export const ScrollStrokeSection: React.FC<{
  className?: string;
  color?: string;
  strokeWidth?: number;
}> = ({ className, color, strokeWidth }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  return (
    <div ref={ref} className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <ScrollStrokePath scrollYProgress={scrollYProgress} color={color} strokeWidth={strokeWidth} />
    </div>
  );
};
