import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Film, Video, User, Briefcase, Globe, MessageSquare, ArrowRight } from 'lucide-react';
import { FadeIn } from '../FadeIn';
import { FloatingEmoji } from '../FloatingEmoji';
import { defaultData, getWhatsAppLink } from '../../lib/store';

const getAssetUrl = (path: string) => {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${cleanBase}${cleanPath}`;
};

const GLASS_CAMERA = getAssetUrl('glass_camera.png');
const GLASS_MEGAPHONE = getAssetUrl('glass_megaphone.png');


const IconMap: { [key: string]: React.ComponentType<any> } = {
  sparkles: Sparkles,
  video: Video,
  user: User,
  film: Film,
  briefcase: Briefcase,
  globe: Globe,
};

export interface ServicesSectionProps {
  data: typeof defaultData;
  theme?: 'light' | 'dark';
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ data, theme = 'dark' }) => {
  const servicesList = data.services || [];
  const [activeService, setActiveService] = useState<any | null>(null);

  useEffect(() => {
    if (activeService) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [activeService]);
  const isLight = theme === 'light';

  const getServiceWhatsAppLink = (serviceName: string) => {
    const message = `Hi Sahil, I want to inquire about your "${serviceName}" service for my brand. Let's connect!`;
    return getWhatsAppLink(data.settings?.whatsappPhone || '8082812805', message);
  };

  return (
    <section className={`${isLight ? 'bg-[#FAF9F6] text-[#0C0C0C]' : 'bg-[#0C0C0C] text-[#D7E2EA]'} rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-16 sm:py-20 md:py-24 w-full relative ${activeService ? 'z-[99999]' : 'z-20'} shadow-2xl overflow-hidden bg-grid-pattern transition-colors duration-500`}>
      {/* Floating Decorative 3D Glass Assets */}
      <FloatingEmoji src={GLASS_CAMERA} alt="Camera" className="top-[25%] left-[2%] sm:left-[4%]" rotation={-15} delay={1.0} lightBg={isLight} />
      <FloatingEmoji src={GLASS_MEGAPHONE} alt="Megaphone" className="bottom-[25%] right-[2%] sm:right-[4%]" rotation={18} delay={1.2} lightBg={isLight} />

      <div className="max-w-[1400px] mx-auto flex flex-col items-center relative z-10">
        <FadeIn delay={0} y={40} className="mb-8 text-center">
          <h2 className={`hero-heading font-black uppercase text-[clamp(2.5rem,7.5vw,110px)] leading-none tracking-wide ${isLight ? 'text-[#0C0C0C]' : ''} transition-colors duration-500`}>
            Services
          </h2>
        </FadeIn>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {servicesList.map((service, idx) => {
            const iconClassName = isLight ? "text-purple-700" : "text-[#BBCCD7]";
            const IconComp = IconMap[service.icon] || Sparkles;
            const icon = <IconComp size={28} className={iconClassName} />;
            const serviceNumber = String(idx + 1).padStart(2, '0');

            return (
              <FadeIn
                key={service.id || idx}
                delay={idx * 0.06}
                y={20}
                className="shadow-xl"
              >
                <motion.div
                  onClick={() => setActiveService(service)}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`border rounded-[24px] p-6 flex flex-col justify-between gap-4 group relative overflow-hidden cursor-pointer ${
                    isLight 
                      ? 'bg-black/5 border-black/5 hover:border-black/20 hover:bg-black/10 hover-card-glow' 
                      : 'bg-white/5 border-white/5 hover:border-[#BBCCD7]/35 hover:bg-white/10 hover-card-glow-dark'
                  }`}
                  style={{ minHeight: '250px' }}
                >
                  <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full pointer-events-none ${isLight ? 'bg-gradient-to-br from-black/5 to-transparent' : 'bg-gradient-to-br from-[#BBCCD7]/5 to-transparent'}`} />
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center w-full">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'}`}>
                        {icon}
                      </div>
                      <span className={`font-mono text-[10px] font-bold tracking-widest ${isLight ? 'text-black/30' : 'text-[#BBCCD7]/30'}`}>
                        {serviceNumber}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className={`font-bold uppercase text-sm sm:text-base tracking-wide ${isLight ? 'text-[#0C0C0C]' : 'text-white'}`}>
                        {service.name}
                      </h3>
                      <p className={`font-light leading-relaxed text-xs sm:text-sm ${isLight ? 'text-[#0C0C0C]/70' : 'text-[#D7E2EA]/70'}`}>
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className={`flex justify-between items-center mt-auto pt-4 border-t ${isLight ? 'border-black/5' : 'border-white/5'}`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(getServiceWhatsAppLink(service.name), '_blank', 'noopener,noreferrer');
                      }}
                      className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition ${isLight ? 'text-purple-700 hover:text-purple-900' : 'text-[#BBCCD7] hover:text-white'}`}
                    >
                      Inquire <ArrowRight size={10} />
                    </button>
                    
                    <span className={`text-[10px] font-medium transition ${isLight ? 'text-[#0C0C0C]/35 group-hover:text-black' : 'text-[#D7E2EA]/30 group-hover:text-[#BBCCD7]/50'}`}>
                      View details →
                    </span>
                  </div>
                </motion.div>
              </FadeIn>
            );
          })}
        </div>
      </div>

      {/* Reusable Premium Popup Modal */}
      <AnimatePresence>
        {activeService && (
          <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setActiveService(null)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-[32px] p-6 sm:p-8 flex flex-col gap-6 relative shadow-2xl z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveService(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition text-[#D7E2EA]/60 hover:text-white"
              >
                ✕
              </button>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  {(() => {
                    const IconComp = IconMap[activeService.icon] || Sparkles;
                    return <IconComp size={24} className="text-[#BBCCD7]" />;
                  })()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-[#BBCCD7]/40 font-bold">
                    Service {String(servicesList.findIndex(s => s.id === activeService.id) + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold uppercase text-white tracking-wide">{activeService.name}</h3>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <p className="text-xs sm:text-sm font-light leading-relaxed text-[#D7E2EA]/85">
                  {activeService.details || activeService.description}
                </p>
              </div>



              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <a
                  href={getServiceWhatsAppLink(activeService.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-500 border border-green-400/30 rounded-2xl text-xs font-bold uppercase tracking-wider text-white hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition flex items-center justify-center gap-2"
                >
                  <MessageSquare size={14} /> Inquire on WhatsApp
                </a>
                <button
                  onClick={() => setActiveService(null)}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-wider text-[#D7E2EA] hover:bg-white/10 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
