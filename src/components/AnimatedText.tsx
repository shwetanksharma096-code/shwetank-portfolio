import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  textColor?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({ text, className = '', textColor = "text-[#D7E2EA]" }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!inView) return;
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        const char = text[index];
        setDisplayedText((prev) => prev + char);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 12); // Smooth typing speed (12ms per letter)

    return () => clearInterval(interval);
  }, [inView, text]);

  // Determine caret color matches text color style
  const caretBgClass = textColor.includes('#0C0C0C') ? 'bg-[#0C0C0C]' : 'bg-[#D7E2EA]';

  return (
    <p
      ref={containerRef}
      className={`font-medium text-center leading-relaxed max-w-5xl mx-auto relative select-none ${textColor} ${className}`}
      style={{ fontSize: 'clamp(1rem, 1.35vw, 1.25rem)', wordSpacing: '0.05em' }}
    >
      <motion.span
        onViewportEnter={() => setInView(true)}
        viewport={{ once: true, margin: "-100px" }}
      >
        {displayedText}
      </motion.span>
      {inView && displayedText.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "steps(2)" as any }}
          className={`inline-block w-[2.5px] h-[1.15em] ml-1 align-middle ${caretBgClass}`}
        />
      )}
    </p>
  );
};


