import React from 'react';
import { motion } from 'framer-motion';
import { PillNav } from '../PillNav';
import { CreepyButton } from '../CreepyButton';

import { defaultData, getWhatsAppLink } from '../../lib/store';

const NAV_ITEMS = [
  { label: 'About',        href: '#about' },
  { label: 'Campaigns',    href: '#campaigns' },
  { label: 'Awards',       href: '#achievements' },
  { label: 'Experience',   href: '#experience' },
  { label: 'Skills',       href: '#skills' },
  { label: 'Contact',      href: '#contact' },
];

interface HeroSectionProps {
  data: typeof defaultData;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ data }) => {
  const whatsappUrl = getWhatsAppLink(data.settings?.whatsappPhone || '8898134096');

  return (
    <section
      id="hero"
      className="min-h-screen w-full flex flex-col justify-between relative bg-[#FFFFFF] text-[#111111] py-4 px-4 sm:px-8 md:px-12 font-sans border-b border-black/10"
    >
      {/* ─── FLOATING PILL NAVBAR ─── */}
      <header className="sticky top-4 z-[1000] w-full max-w-4xl mx-auto">
        <PillNav
          logo="SS"
          logoAlt="Shwetank Sharma"
          items={NAV_ITEMS}
          activeHref="#hero"
          baseColor="#111111"
          pillColor="#FFFFFF"
          pillTextColor="#111111"
          hoveredPillTextColor="#111111"
        />
      </header>

      {/* ─── MAIN EDITORIAL BANNER ─── */}
      <div className="max-w-[95%] mx-auto w-full flex flex-col items-center justify-center text-center my-auto relative z-10 px-4 sm:px-8 pt-6">
        
        {/* Top Tag & Awards Pill */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-6">
          {(data as any).hero?.topTag && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] px-3.5 py-1 rounded-full bg-[#FFE600] text-black">
              {(data as any).hero.topTag}
            </span>
          )}
          {(data as any).hero?.awardsTag && (
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-[0.2em] px-3.5 py-1 rounded-full bg-black text-white">
              {(data as any).hero.awardsTag}
            </span>
          )}
        </div>

        {/* High-Impact Statement Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative max-w-none"
        >
          <h1 className="font-extrabold uppercase leading-[1.05] tracking-tight text-[#111111] text-[clamp(2.5rem,6.8vw,96px)]">
            {(data as any).hero?.headlinePart1 || 'CLIENT SERVICING & CAMPAIGN MANAGEMENT'} <span style={{ color: (data as any).hero?.headlineHighlightColor || '#EAB308' }}>{(data as any).hero?.headlineHighlight || 'DRIVING IMPACT'}</span> {(data as any).hero?.headlinePart2 || 'FOR TOP BRAND ACCOUNTS.'}
          </h1>
        </motion.div>

        {/* Sub-paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-xs sm:text-base font-medium text-[#111111]/85 max-w-3xl leading-relaxed"
        >
          Client servicing and account management professional with 4+ years of experience leading integrated marketing campaigns for various brands. Skilled at managing client relationships, campaign executions and finances, and cross-functional teams, with a track record of award-winning creative execution. Comfortable using modern AI tools to plan faster and sharper.
        </motion.p>

        {/* Action Buttons using Creepy Eye Tracking Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-8 flex flex-wrap justify-center items-center gap-4"
        >
          <CreepyButton onClick={() => window.open(whatsappUrl, '_blank')}>
            Start Conversation ⚡
          </CreepyButton>

          <a
            href={`mailto:${data.about?.email || 'shwetank.sharma096@gmail.com'}`}
            className="px-7 py-3.5 rounded-full text-xs font-black uppercase tracking-widest bg-[#111111] text-white hover:bg-black/80 transition-all shadow-sm"
          >
            Email Me
          </a>
        </motion.div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto w-full mt-10 border-t border-black/10 pt-4 flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-[#111111]/50 px-4">
        <span>SHWETANK SHARMA // ASSOCIATE ACCOUNT MANAGER</span>
        <span>SCROLL TO EXPLORE ↓</span>
      </div>
    </section>
  );
};
