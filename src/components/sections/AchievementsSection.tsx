import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Trophy } from 'lucide-react';
import { defaultData } from '../../lib/store';

interface AchievementCardProps {
  ach: any;
  i: number;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ ach, i }) => {
  // Combine photoUrls array or fallback to the single photoUrl if photoUrls isn't populated
  const photos = ach.photoUrls && ach.photoUrls.length > 0
    ? ach.photoUrls
    : (ach.photoUrl ? [ach.photoUrl] : []);

  const [activeIdx, setActiveIdx] = React.useState(0);

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: i * 0.1 }}
      className="bg-white rounded-3xl border border-black/15 p-6 shadow-xl flex flex-col justify-between gap-5 relative overflow-hidden group hover:border-[#EAB308] transition-all"
    >
      {/* Photo Banner/Carousel if available */}
      {photos.length > 0 ? (
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-black/10 bg-[#F4F4F6] flex items-center justify-center">
          {/* Active Image */}
          <img
            src={photos[activeIdx]}
            alt={ach.title}
            className="max-w-full max-h-full object-contain group-hover:scale-[1.02] transition duration-500"
          />

          {/* Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#FFE600] text-black border border-black/20 shadow-md">
              {ach.badge || '🏆 AWARD WINNER'}
            </span>
          </div>

          {/* Carousel Navigation Buttons */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black text-xs transition z-10"
                title="Previous photo"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black text-xs transition z-10"
                title="Next photo"
              >
                ▶
              </button>
              {/* Dot Indicators */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                {photos.map((_: string, idx: number) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === activeIdx ? 'bg-[#FFE600] w-3' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#FFE600] text-black border border-black/20">
            {ach.badge || '🏆 AWARD WINNER'}
          </span>
          <Trophy size={20} className="text-[#EAB308]" />
        </div>
      )}

      {/* Title & Caption */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono font-bold uppercase text-black/50">{ach.dateText}</span>
        <h3 className="font-extrabold text-lg text-black uppercase tracking-tight leading-snug">
          {ach.title}
        </h3>
        <p className="text-xs text-black/75 font-normal leading-relaxed">
          {ach.caption}
        </p>

        {/* Hashtags */}
        {ach.hashtags && ach.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {ach.hashtags.map((tag: string, idx: number) => (
              <span key={idx} className="text-[10px] font-mono font-bold text-[#0A66C2] bg-[#0A66C2]/10 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Link Action Button */}
      {ach.linkUrl ? (
        <a
          href={ach.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-2xl bg-[#111111] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#FFE600] hover:text-black transition shadow-md"
        >
          <span>View Post / Verification</span>
          <ExternalLink size={14} />
        </a>
      ) : (
        <div className="w-full py-2.5 rounded-2xl bg-[#F4F4F6] text-black/50 text-[10px] font-mono font-bold uppercase tracking-wider text-center">
          Verified Achievement
        </div>
      )}
    </motion.div>
  );
};

interface AchievementsSectionProps {
  achievements: typeof defaultData.achievements;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ achievements }) => {
  const items = achievements && achievements.length > 0 ? achievements : defaultData.achievements;

  return (
    <section id="achievements" className="w-full bg-[#FFFFFF] text-[#111111] py-16 px-4 sm:px-8 md:px-12 font-sans border-b border-black/10">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-black/10 pb-6">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full bg-[#FFE600] text-black">
              004. ACHIEVEMENTS & AWARDS
            </span>
            <div className="flex flex-col gap-2 mt-3">
              <h2 className="font-extrabold text-4xl sm:text-7xl uppercase tracking-tight text-black leading-none break-words">
                RECOGNITIONS & AWARDS
              </h2>
            </div>
          </div>
        </div>

        {/* Achievement Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((ach, i) => (
            <AchievementCard key={ach.id || i} ach={ach} i={i} />
          ))}
        </div>

      </div>
    </section>
  );
};
