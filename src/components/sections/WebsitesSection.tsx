import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { FadeIn } from '../FadeIn';
import { FloatingEmoji } from '../FloatingEmoji';
import { defaultData } from '../../lib/store';

const getAssetUrl = (path: string) => {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${cleanBase}${cleanPath}`;
};

const GLASS_CAMERA = getAssetUrl('glass_camera.png');
const GLASS_SPARKLES = getAssetUrl('glass_sparkles.png');

interface WebsitesSectionProps {
  websites: typeof defaultData.websites;
  theme?: 'light' | 'dark';
}

export const WebsitesSection: React.FC<WebsitesSectionProps> = ({ websites, theme = 'dark' }) => {
  const isLight = theme === 'light';

  return (
    <section
      id="websites"
      className={`${isLight ? 'bg-[#FAF9F6] text-[#0C0C0C]' : 'bg-[#0C0C0C] text-[#D7E2EA]'} rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 z-20 px-5 sm:px-8 md:px-10 py-16 sm:py-20 md:py-24 flex flex-col relative overflow-hidden transition-colors duration-500`}
    >
      {/* Floating 3D Glass Assets */}
      <FloatingEmoji src={GLASS_CAMERA} alt="Camera" className="top-[25%] left-[2%] sm:left-[4%]" rotation={10} delay={0.5} lightBg={isLight} />
      <FloatingEmoji src={GLASS_SPARKLES} alt="Sparkles" className="bottom-[25%] right-[2%] sm:right-[4%]" rotation={-15} delay={0.7} lightBg={isLight} />
      <div className="max-w-[1400px] mx-auto w-full flex flex-col items-center mb-12 relative z-10">
        <FadeIn delay={0} y={40}>
          <p className={`text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold ${isLight ? 'text-[#0C0C0C]/55' : 'text-[#D7E2EA]/40'} mb-2 text-center`}>Digital Experiences</p>
          <h2 className={`hero-heading font-black uppercase text-[clamp(2.5rem,7.5vw,110px)] leading-none tracking-wide text-center ${isLight ? 'text-[#0C0C0C]' : 'text-[#D7E2EA]'} transition-colors duration-500`}>
            Websites Built
          </h2>
        </FadeIn>
      </div>

      <div className="max-w-[1400px] mx-auto w-full flex flex-wrap justify-center gap-6 sm:gap-8 relative z-10">
        {websites && websites.length > 0 ? (
          websites.map((site) => (
            <FadeIn key={site.id} y={20} className="w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-lg flex">
              <motion.a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`w-full block border rounded-3xl p-3 flex flex-col gap-4 group transition duration-300 shadow-lg ${
                  isLight 
                    ? 'bg-black/5 border-black/5 hover:border-black/20 hover:bg-black/10 hover-card-glow' 
                    : 'bg-white/5 border-white/5 hover:border-[#BBCCD7]/30 hover:bg-white/10 hover-card-glow-dark'
                }`}
              >
                <div className={`relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border ${isLight ? 'border-black/5' : 'border-white/5'}`}>
                  <img
                    src={site.previewUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"}
                    alt={site.title}
                    className="w-full h-full object-cover group-hover:scale-[1.05] transition duration-700 bg-zinc-800"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.dataset.failed) {
                        target.dataset.failed = 'true';
                        target.src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop";
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-white/10 border border-white/20 text-white rounded-full px-4 py-2 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                      Visit Site <ArrowUpRight size={12} />
                    </span>
                  </div>
                </div>
                <div className="px-2 pb-2 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(site.tags || []).map((t: string) => (
                      <span key={t} className={`text-[8px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isLight 
                          ? 'bg-black/5 border border-black/10 text-purple-700' 
                          : 'bg-white/5 border border-white/10 text-[#BBCCD7]'
                      }`}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <h4 className={`text-lg sm:text-xl font-bold uppercase tracking-wide transition duration-200 flex items-center justify-between mt-auto ${
                    isLight ? 'text-[#0C0C0C] group-hover:text-black' : 'text-[#D7E2EA] group-hover:text-white'
                  }`}>
                    {site.title}
                    <ArrowUpRight size={16} className={`${isLight ? 'text-[#0C0C0C]/50 group-hover:text-black' : 'text-[#D7E2EA]/50 group-hover:text-white'} transition`} />
                  </h4>
                  <p className={`text-xs font-light mt-1 line-clamp-2 ${isLight ? 'text-[#0C0C0C]/60' : 'text-[#D7E2EA]/60'}`}>
                    {site.description}
                  </p>
                </div>
              </motion.a>
            </FadeIn>
          ))
        ) : (
          <div className={`text-center py-20 italic w-full ${isLight ? 'text-[#0C0C0C]/30' : 'text-[#D7E2EA]/30'}`}>No websites added yet. Add them in the admin dashboard.</div>
        )}
      </div>
    </section>
  );
};
