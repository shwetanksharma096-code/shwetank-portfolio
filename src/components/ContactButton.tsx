import React from 'react';

interface ContactButtonProps {
  onClick?: () => void;
}

export const ContactButton: React.FC<ContactButtonProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full font-medium uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 active:scale-95"
      style={{
        background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
        boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset',
        outline: '2px solid white',
        outlineOffset: '-3px',
        padding: '0.75rem 2rem', // px-8 py-3
      }}
    >
      <span className="text-xs sm:text-sm md:text-base px-2 sm:px-4 md:px-6">
        Contact Me
      </span>
    </button>
  );
};
