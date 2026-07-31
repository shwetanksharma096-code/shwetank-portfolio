import React from 'react';

interface LiveProjectButtonProps {
  onClick?: () => void;
}

export const LiveProjectButton: React.FC<LiveProjectButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base hover:bg-[#D7E2EA]/10 transition-all duration-300 hover:scale-105 active:scale-95"
    >
      Live Project
    </button>
  );
};
