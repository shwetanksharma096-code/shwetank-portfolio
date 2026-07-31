import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Trophy } from 'lucide-react';
import { defaultData } from '../../lib/store';

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
            <motion.div
              key={ach.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-3xl border border-black/15 p-6 shadow-xl flex flex-col justify-between gap-5 relative overflow-hidden group hover:border-[#EAB308] transition-all"
            >
              {/* Photo Banner if available */}
              {ach.photoUrl ? (
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-black/10 bg-[#F4F4F6]">
                  <img
                    src={ach.photoUrl}
                    alt={ach.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#FFE600] text-black border border-black/20 shadow-md">
                      {ach.badge || '🏆 AWARD WINNER'}
                    </span>
                  </div>
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
          ))}
        </div>

      </div>
    </section>
  );
};
