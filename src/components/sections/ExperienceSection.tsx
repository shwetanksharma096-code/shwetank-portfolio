import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Calendar, MapPin, X, ArrowUpRight } from 'lucide-react';
import { defaultData } from '../../lib/store';

interface ExperienceSectionProps {
  experience: typeof defaultData.experience;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experience }) => {
  const [activeExp, setActiveExp] = useState<typeof defaultData.experience[0] | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    if (!activeExp) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveExp(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeExp]);

  return (
    <section id="experience" className="w-full bg-[#FFFFFF] text-[#111111] py-16 px-4 sm:px-8 md:px-12 font-sans border-b border-black/10">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-black/10 pb-6">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#FFE600] text-black">
              004. TIMELINE & ROLES
            </span>
            <div className="flex flex-col gap-2 mt-3">
              <h2 className="font-extrabold text-4xl sm:text-7xl uppercase tracking-tight text-black leading-none break-words">
                CAREER TIMELINE
              </h2>
            </div>
          </div>
        </div>

        {/* Timeline Cards */}
        {experience && experience.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experience.map((ex, i) => (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                onClick={() => setActiveExp(ex)}
                className="bg-[#F4F4F6] border border-black/10 rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-4 cursor-pointer group hover:border-black hover:bg-white transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-extrabold uppercase px-3 py-1 rounded-full bg-[#FFE600] text-black border border-black/20">
                      {ex.year}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/50 group-hover:text-black transition flex items-center gap-1">
                      View Details <ArrowUpRight size={12} />
                    </span>
                  </div>

                  <h3 className="font-extrabold text-xl sm:text-2xl uppercase text-black tracking-tight leading-tight group-hover:text-[#EAB308] transition">
                    {ex.role}
                  </h3>
                  <p className="text-xs font-bold text-black/70 uppercase tracking-wider mt-0.5">
                    {ex.company}
                  </p>
                </div>

                <p className="text-xs text-black/75 leading-relaxed line-clamp-3 border-t border-black/10 pt-3 font-normal">
                  {ex.description}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-[#F4F4F6] border border-black/10 rounded-2xl p-8 text-center text-xs font-mono text-black/40">
            No work experience records set.
          </div>
        )}

      </div>
      {/* Experience Detail Modal */}
      <AnimatePresence>
        {activeExp && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exp-modal-title"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            {/* Backdrop close */}
            <div className="absolute inset-0" onClick={() => setActiveExp(null)} aria-hidden="true" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl z-10 text-black border border-black/10"
            >
              <button
                type="button"
                onClick={() => setActiveExp(null)}
                aria-label="Close experience detail"
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition text-black"
              >
                <X size={16} />
              </button>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFE600] border border-black/20 flex items-center justify-center text-black shrink-0">
                  <Briefcase size={22} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-black/50">Position &amp; Organization</span>
                  <h3 id="exp-modal-title" className="font-extrabold text-xl uppercase text-black tracking-tight">{activeExp.role}</h3>
                  <span className="text-xs font-bold text-black/70">{activeExp.company}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-mono py-3 border-t border-b border-black/10 text-black/70">
                <span className="flex items-center gap-1.5 font-bold"><Calendar size={13} className="text-black" />{activeExp.year}</span>
                <span className="flex items-center gap-1.5 font-bold"><MapPin size={13} className="text-black" />Mumbai, India</span>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed text-black/85 font-normal">{activeExp.description}</p>

              <button
                type="button"
                onClick={() => setActiveExp(null)}
                className="self-end px-6 py-2.5 rounded-full bg-black text-white text-xs font-black uppercase tracking-wider transition hover:bg-[#FFE600] hover:text-black shadow-md"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
