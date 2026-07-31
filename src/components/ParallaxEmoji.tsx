import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxEmojiProps {
  src: string;
  alt: string;
  className: string;
  delay?: number;
  rotation?: number;
  parallaxY?: number;
}

const isTouchDevice = typeof window !== 'undefined'
  ? ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  : false;

export const ParallaxEmoji: React.FC<ParallaxEmojiProps> = ({
  src,
  alt,
  className,
  delay = 0,
  rotation = 0,
  parallaxY = -80
}) => {
  const { scrollY } = useScroll();
  // On mobile: no parallax (prevents scroll jank)
  const y = useTransform(scrollY, [0, 600], isTouchDevice ? [0, 0] : [0, parallaxY]);

  return (
    <motion.div
      drag={!isTouchDevice}
      dragSnapToOrigin={!isTouchDevice}
      dragElastic={0.5}
      dragTransition={{ bounceStiffness: 220, bounceDamping: 22 }}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={`hidden lg:block absolute select-none z-[1] w-[60px] xl:w-[90px] aspect-square cursor-grab active:cursor-grabbing touch-none ${className}`}
      style={{ y, mixBlendMode: 'screen', willChange: 'transform' }}
    >
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [rotation - 3, rotation + 3, rotation - 3] }}
        transition={{
          y:      { duration: 6, repeat: Infinity, ease: 'easeInOut', delay },
          rotate: { duration: 9, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.5 },
        }}
        className="w-full h-full pointer-events-none"
        style={{ willChange: 'transform' }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain pointer-events-none"
          loading="lazy"
          decoding="async"
        />
      </motion.div>
    </motion.div>
  );
};
