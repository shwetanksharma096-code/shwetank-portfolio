import React from 'react';
import { motion } from 'framer-motion';
import { defaultData } from '../../lib/store';

interface SkillsSectionProps {
  skills: typeof defaultData.skills;
  languages?: string;
  location?: string;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, languages, location }) => {
  return (
    <section id="skills" className="w-full bg-[#FFFFFF] text-[#111111] py-16 px-4 sm:px-8 md:px-12 font-sans border-b border-black/10">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-black/10 pb-6">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#FFE600] text-black">
              005. SKILLS & ABILITIES
            </span>
            <div className="flex flex-col gap-2 mt-3">
              <h2 className="font-extrabold text-4xl sm:text-7xl uppercase tracking-tight text-black leading-none break-words">
                EXPERTISE
              </h2>
            </div>
          </div>
        </div>

        {/* Skills List Card (Full Width) */}
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-[#F4F4F6] border border-black/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm w-full"
          >
            <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-black/60">
              Core Competencies
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs font-mono text-black/80 leading-relaxed">
              {skills && skills.length > 0 ? (
                skills.map((skill) => (
                  <div key={skill} className="flex items-start gap-2 border-b border-black/10 pb-2.5">
                    <span className="text-[#EAB308] font-bold mt-0.5">--</span>
                    <span className="uppercase tracking-wider font-extrabold text-black leading-snug">{skill}</span>
                  </div>
                ))
              ) : (
                <div className="text-black/40 italic">No skills listed.</div>
              )}
            </div>

            <div className="border-t border-black/10 pt-4 text-[10px] uppercase font-mono font-bold text-black/60 flex justify-between flex-wrap gap-2">
              <span>{languages || "LANGUAGES: HINDI • ENGLISH • MARATHI"}</span>
              <span>{location || "MUMBAI, INDIA"}</span>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
