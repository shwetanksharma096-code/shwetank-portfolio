import React from 'react';
import { motion } from 'framer-motion';

import { defaultData, getWhatsAppLink } from '../../lib/store';

interface AboutSectionProps {
  data: typeof defaultData;
  theme?: 'light' | 'dark';
}

export const AboutSection: React.FC<AboutSectionProps> = ({ data }) => {
  return (
    <section id="about" className="w-full bg-[#FFFFFF] text-[#111111] py-16 px-4 sm:px-8 md:px-12 font-sans border-b border-black/10">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">

        {/* 1. "WHY" SECTION (3-Column Card Grid with Pencil Typewriter text) */}
        <div className="flex flex-col items-center gap-8 relative">
          
          {/* Main Overlay Title */}
          <div className="text-center relative z-10">
            <h2 className="font-extrabold text-5xl sm:text-7xl uppercase tracking-tight text-[#111111] leading-none">
              WHY ME?
            </h2>
            <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-black/60 mt-2">
              CAMPAIGN EXCELLENCE & STRATEGIC <span className="font-handwriting normal-case font-normal italic text-[#EAB308] text-sm sm:text-base tracking-normal">brand growth</span>
            </p>
          </div>

          {/* 3 Portrait Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
            
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-black/10 bg-[#F4F4F6] shadow-xl group flex flex-col justify-between p-6"
            >
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-black/50">01 / ILLUMINATI CREATIVE</span>
              <div>
                <h3 className="font-extrabold text-2xl uppercase tracking-tight leading-tight mb-2 text-black">
                  CAMPAIGN & BRAND MANAGEMENT
                </h3>
                <p className="text-xs font-medium text-black/80 leading-relaxed">
                  Leading major accounts: Raymond, ColorPlus, Ethnix, Pantaloons, Yousta, and Reliance Trends.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#EAB308]">
                MAY 2024 – PRESENT
              </span>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-black/10 bg-[#FFE600] text-black shadow-xl group"
            >
              <div className="w-full h-full flex flex-col justify-between p-6">
                <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-black">02 / AWARDS</span>
                <div>
                  <h3 className="font-extrabold text-3xl uppercase tracking-tight leading-none mb-2">
                    2x E4M WINNER 🏆
                  </h3>
                  <p className="text-xs font-bold text-black/85 leading-relaxed">
                    Pantaloons "Masters of Style" Campaign: Won Best Campaign in Performance Marketing & E4M IDMA 2026 for Digital Innovation.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://www.linkedin.com/posts/shwetank-sharma-63a804180_e4mawards-bestinfluencermarketing-pantaloonsmasterofstyle-activity-7466172773737058304-uBkn?utm_source=share&utm_medium=member_android&rcm=ACoAACrVfo4BlvlaVEUzhBea4cruXsG7kh11Wpw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-wider text-center hover:bg-white hover:text-black transition"
                  >
                    View E4M Performance Award Post ↗
                  </a>
                  <a
                    href="https://www.linkedin.com/posts/shwetank-sharma-63a804180_digitalinnovation-award-pantaloons-ugcPost-7488479640446189568-j21g/?utm_source=share&utm_medium=member_android&rcm=ACoAACrVfo4BlvlaVEUzhBea4cruXsG7kh11Wpw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-white text-black border border-black/20 text-[10px] font-black uppercase tracking-wider text-center hover:bg-black hover:text-white transition"
                  >
                    View E4M Digital Innovation Post ↗
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-black/10 bg-[#111111] text-white shadow-xl group"
            >
              <div className="w-full h-full flex flex-col justify-between p-6">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FFE600]">03 / AI & FINANCES</span>
                <div>
                  <h3 className="font-extrabold text-3xl uppercase tracking-tight leading-none mb-2 text-white">
                    P&L & AI INTEGRATION
                  </h3>
                  <p className="text-xs font-medium text-white/70 leading-relaxed">
                    Managing team P&L, campaign estimates, cost sheets & leveraging ChatGPT, NotebookLM & Claude for faster planning.
                  </p>
                </div>
                <a
                  href={getWhatsAppLink(data.settings?.whatsappPhone || '8898134096')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-[#FFE600] text-black text-xs font-bold uppercase tracking-wider text-center"
                >
                  Work With Me →
                </a>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
};
