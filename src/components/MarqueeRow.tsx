import React, { useRef, useEffect } from 'react';
import { getYoutubeThumbnail } from '../lib/store';

export interface MarqueeVideo {
  id: string;
  url: string;
  title: string;
  tags?: string[];
  projectTitle?: string;
  thumbnailUrl?: string;
}

const FALLBACK_MARQUEE_VIDEOS: MarqueeVideo[] = [
  { id: 'fb1', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Urban Monkey - PLS S2', tags: ['MUSIC', 'EDITOR'], projectTitle: 'Parking Lot Sessions' },
  { id: 'fb2', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Celebrity BTS Reel', tags: ['BRAND', 'BTS'], projectTitle: 'BTS Edits' },
  { id: 'fb3', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Sony SAB Campaign', tags: ['INFLUENCER', 'CAMPAIGN'], projectTitle: 'Brand Integration' },
  { id: 'fb4', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Flipkart Brand Integration', tags: ['MARKETING'], projectTitle: 'Influencer Marketing' },
  { id: 'fb5', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Tata Motors Launch BTS', tags: ['BTS', 'PRODUCTION'], projectTitle: 'BTS Campaigns' },
  { id: 'fb6', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'My11Circle Cricket Promo', tags: ['INFLUENCER'], projectTitle: 'Brand Integrations' },
];

interface MarqueeRowProps {
  videos: MarqueeVideo[];
  direction: 'left' | 'right';
  onSelectVideo: (video: MarqueeVideo) => void;
}

export const MarqueeRow: React.FC<MarqueeRowProps> = ({ videos, direction, onSelectVideo }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const videosHash = videos.map(v => v.id).join(',');
  
  let baseVideos = [...videos];
  if (baseVideos.length > 0) {
    while (baseVideos.length < 8) {
      baseVideos = [...baseVideos, ...baseVideos];
    }
  } else {
    baseVideos = FALLBACK_MARQUEE_VIDEOS;
  }
  const tripledVideos = [...baseVideos, ...baseVideos, ...baseVideos];

  const isDragging = useRef(false);
  const isInteracting = useRef(false);
  const isHovered = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const dragDistance = useRef(0);
  
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  
  const scrollX = useRef(0);
  
  // Auto-scroll speed: 0.5px per frame at 60fps
  const autoScrollSpeed = direction === 'left' ? 0.5 : -0.5;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let hasInitializedScroll = false;
    let lastFrameTime = performance.now();

    const loop = (now: number) => {
      if (!el) return;
      const deltaTime = Math.min(now - lastFrameTime, 50);
      lastFrameTime = now;

      const singleWidth = el.scrollWidth / 3;
      if (singleWidth <= 0) {
        animationFrameId.current = requestAnimationFrame(loop);
        return;
      }

      if (!hasInitializedScroll) {
        scrollX.current = singleWidth;
        el.scrollLeft = Math.round(scrollX.current);
        hasInitializedScroll = true;
      }

      if (isDragging.current) {
        scrollX.current = el.scrollLeft;
      }

      // Wrap-around checks
      if (scrollX.current >= singleWidth * 2) {
        scrollX.current -= singleWidth;
        el.scrollLeft = Math.round(scrollX.current);
      } else if (scrollX.current <= singleWidth - 100) {
        scrollX.current += singleWidth;
        el.scrollLeft = Math.round(scrollX.current);
      }

      if (!isDragging.current) {
        if (Math.abs(velocity.current) > 0.05) {
          scrollX.current += velocity.current;
          el.scrollLeft = Math.round(scrollX.current);
          velocity.current *= 0.95; // decay velocity
        } else {
          isInteracting.current = false;
          velocity.current = 0;

          if (!isHovered.current) {
            const speed = autoScrollSpeed * (deltaTime / 16.666);
            scrollX.current += speed;
            el.scrollLeft = Math.round(scrollX.current);
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);

    const handleResize = () => {
      const bW = el.scrollWidth / 3;
      if (el.scrollLeft < bW) {
        scrollX.current += bW;
        el.scrollLeft = Math.round(scrollX.current);
      } else if (el.scrollLeft >= bW * 2) {
        scrollX.current -= bW;
        el.scrollLeft = Math.round(scrollX.current);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [autoScrollSpeed, videosHash]);

  const handleStart = (clientX: number) => {
    isDragging.current = true;
    isInteracting.current = true;
    velocity.current = 0;
    startX.current = clientX;
    dragDistance.current = 0;
    if (scrollRef.current) {
      startScrollLeft.current = scrollRef.current.scrollLeft;
      scrollX.current = scrollRef.current.scrollLeft;
    }
    lastX.current = clientX;
    lastTime.current = performance.now();
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current || !scrollRef.current) return;
    
    const now = performance.now();
    const dt = now - lastTime.current;
    
    const dx = clientX - startX.current;
    dragDistance.current = Math.abs(dx);
    
    scrollX.current = startScrollLeft.current - dx;
    scrollRef.current.scrollLeft = Math.round(scrollX.current);
    
    if (dt > 0) {
      const currentXDiff = clientX - lastX.current;
      const instantVelocity = -(currentXDiff / dt) * 16.666;
      velocity.current = velocity.current * 0.4 + instantVelocity * 0.6;
    }
    
    lastX.current = clientX;
    lastTime.current = now;
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    handleStart(e.clientX);
    
    const handleWindowMouseMove = (ev: MouseEvent) => {
      handleMove(ev.clientX);
    };
    
    const handleWindowMouseUp = () => {
      handleEnd();
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
    
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    handleEnd();
  };

  const handleItemClick = (video: MarqueeVideo) => {
    if (dragDistance.current > 6) return;
    onSelectVideo(video);
  };

  return (
    <div 
      className="flex w-full overflow-hidden relative py-2 select-none pointer-events-auto cursor-grab active:cursor-grabbing"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => { isHovered.current = true; }}
      onMouseLeave={() => { isHovered.current = false; }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#0C0C0C] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#0C0C0C] to-transparent z-10 pointer-events-none" />

      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 whitespace-nowrap overflow-x-hidden scrollbar-none"
        style={{
          scrollbarWidth: 'none',
          willChange: 'scroll-position',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden' as any,
        }}
      >
        {tripledVideos.map((video, idx) => {
          const thumb = video.thumbnailUrl || getYoutubeThumbnail(video.url) || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600";
          return (
            <div
              key={`${video.id}-${idx}`}
              onClick={() => handleItemClick(video)}
              className="flex-shrink-0 w-[180px] sm:w-[240px] md:w-[280px] bg-white/5 border border-white/5 hover:border-[#BBCCD7]/30 hover:bg-white/10 rounded-2xl p-2.5 flex flex-col gap-2 cursor-pointer transition duration-300 group"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 bg-zinc-900">
                <img
                  src={thumb}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 pointer-events-none"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                  <span className="bg-white/15 backdrop-blur-md border border-white/20 text-white rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase">▶ PLAY</span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 px-1 truncate">
                <span className="text-[9px] uppercase tracking-wider text-[#BBCCD7]/60 font-semibold font-mono">
                  {video.projectTitle || (video.tags && video.tags[0]) || 'VIDEO'}
                </span>
                <span className="text-xs font-semibold text-[#D7E2EA] group-hover:text-white truncate">
                  {video.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
