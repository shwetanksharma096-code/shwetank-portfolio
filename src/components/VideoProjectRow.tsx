import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getYoutubeThumbnail } from '../lib/store';

interface VideoProjectRowProps {
  project: any;
  onSelectVideo: (video: any) => void;
  theme?: 'light' | 'dark';
}

export const VideoProjectRow: React.FC<VideoProjectRowProps> = ({ project, onSelectVideo, theme = 'dark' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftState = useRef(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const vids = project.videos || [];

  const checkArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 15);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 15);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkArrows);
    checkArrows();
    window.addEventListener('resize', checkArrows);
    return () => {
      el.removeEventListener('scroll', checkArrows);
      window.removeEventListener('resize', checkArrows);
    };
  }, [project]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amt = el.clientWidth * 0.7;
    el.scrollBy({
      left: dir === 'left' ? -amt : amt,
      behavior: 'smooth'
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDown.current = true;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftState.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current) return;
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    el.scrollLeft = scrollLeftState.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDown.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDown.current = true;
    startX.current = e.touches[0].pageX - el.offsetLeft;
    scrollLeftState.current = el.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDown.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const x = e.touches[0].pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    el.scrollLeft = scrollLeftState.current - walk;
  };

  if (vids.length === 0) return null;

  const isLight = theme === 'light';

  return (
    <div className={`w-full flex flex-col gap-4 border-b ${isLight ? 'border-black/5' : 'border-white/5'} pb-8 mb-8 last:border-b-0 last:pb-0 last:mb-0`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-1 mb-1.5">
            {(project.tags || []).map((t: string) => (
              <span key={t} className={`text-[8px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isLight 
                  ? 'bg-black/5 border-black/10 text-purple-700' 
                  : 'bg-white/5 border border-white/10 text-[#BBCCD7]'
              }`}>
                {t}
              </span>
            ))}
          </div>
          <h4 className={`text-lg sm:text-xl font-bold uppercase tracking-wide ${isLight ? 'text-[#0C0C0C]' : 'text-[#D7E2EA]'}`}>
            {project.title}
          </h4>
          <p className={`text-xs font-light max-w-2xl mt-0.5 leading-relaxed ${isLight ? 'text-[#0C0C0C]/60' : 'text-[#D7E2EA]/50'}`}>
            {project.description}
          </p>
        </div>
        <span className={`text-[9px] uppercase tracking-widest font-semibold font-mono ${isLight ? 'text-[#0C0C0C]/40' : 'text-[#D7E2EA]/30'}`}>
          {vids.length} cut{vids.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="relative group/gallery w-full">
        {showLeftArrow && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white flex items-center justify-center z-10 opacity-0 group-hover/gallery:opacity-100 transition duration-300 shadow-2xl font-bold text-lg"
          >
            ‹
          </button>
        )}
        {showRightArrow && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white flex items-center justify-center z-10 opacity-0 group-hover/gallery:opacity-100 transition duration-300 shadow-2xl font-bold text-lg"
          >
            ›
          </button>
        )}

        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
          className="flex gap-4 overflow-x-auto md:overflow-x-hidden cursor-grab active:cursor-grabbing select-none py-5 scrollbar-none max-w-fit mx-auto w-full"
          style={{ scrollbarWidth: 'none' }}
        >
          {vids.map((v: any) => {
            const thumb = v.thumbnailUrl || getYoutubeThumbnail(v.url) || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600";
            return (
              <motion.div
                key={v.id}
                onClick={() => onSelectVideo(v)}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`flex-shrink-0 w-[240px] sm:w-[280px] border rounded-2xl p-2.5 flex flex-col gap-2.5 group transition duration-300 cursor-pointer shadow-lg ${
                  isLight 
                    ? 'bg-black/5 border-black/5 hover:border-black/20 hover:bg-black/10 hover-card-glow' 
                    : 'bg-white/5 border-white/5 hover:border-[#BBCCD7]/30 hover:bg-white/10 hover-card-glow-dark'
                }`}
              >
                <div className={`relative aspect-video rounded-xl overflow-hidden bg-zinc-900 pointer-events-none border ${isLight ? 'border-black/5' : 'border-white/5'}`}>
                  <img
                    src={thumb}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full p-2.5 text-[9px] font-bold tracking-wider uppercase">▶ PLAY</span>
                  </div>
                </div>
                <span className={`text-xs font-semibold truncate transition duration-200 px-1 ${
                  isLight ? 'text-[#0C0C0C] group-hover:text-black' : 'text-[#D7E2EA] group-hover:text-white'
                }`}>
                  {v.title}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
