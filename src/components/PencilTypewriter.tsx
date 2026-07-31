import React, { useState, useEffect } from 'react';

interface PencilTypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}

export const PencilTypewriter: React.FC<PencilTypewriterProps> = ({
  text,
  speed = 40,
  delay = 300,
  className = ''
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, isStarted, text, speed]);

  return (
    <span className={`inline-flex items-center font-handwriting ${className}`}>
      <span>{displayedText}</span>
      {displayedText.length < text.length && (
        <span className="inline-block w-2 h-4 bg-[#EAB308] ml-0.5 animate-pulse rounded-sm" />
      )}
    </span>
  );
};
