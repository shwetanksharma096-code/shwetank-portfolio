import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { defaultData, getWhatsAppLink } from '../../lib/store';

interface FooterSectionProps {
  data: typeof defaultData;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ data }) => {
  const whatsappUrl = getWhatsAppLink(data.settings?.whatsappPhone || '8898134096');
  const linkedinUrl = data.heroStats?.linkedinUrl || 'https://www.linkedin.com/in/shwetank-sharma-63a804180/';
  const instagramUrl = data.about?.instagramUrl || data.heroStats?.instagramUrl || 'https://www.instagram.com/shwetank_sharma096';

  return (
    <footer id="contact" className="w-full bg-[#FFFFFF] text-[#111111] py-16 px-4 sm:px-8 md:px-12 font-sans border-t border-black/10">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">

        {/* Contact Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="bg-[#FFE600] rounded-3xl p-8 sm:p-12 text-black shadow-2xl relative overflow-hidden border border-black/10 flex flex-col gap-8"
        >
          <div className="flex justify-between items-start flex-wrap gap-4">
            <span className="font-mono text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full bg-black text-white w-fit">
              006. CONNECT &amp; LOCATION
            </span>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider bg-black/10 px-3 py-1 rounded-full border border-black/20">
              <MapPin size={14} className="text-black" />
              <span>{data.settings?.locationAddress || "Kalyan, Mumbai, MH - 421301"}</span>
            </div>
          </div>

          <h2 className="font-extrabold text-5xl sm:text-7xl uppercase tracking-tight leading-none text-black">
            LET'S WORK <span className="font-handwriting normal-case font-normal italic text-white tracking-normal text-[1.1em]">together</span>
          </h2>

          <p className="text-xs sm:text-sm font-semibold text-black/85 leading-relaxed max-w-2xl">
            {data.settings?.footerBio || "Client servicing and account management professional with 4+ years of experience leading integrated marketing campaigns for various brands. Open for senior client servicing, campaign execution, and brand management roles."}
          </p>

          {/* Social Logo Connect Grid - Icon Only Buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
            {/* WhatsApp Logo Circle */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Chat on WhatsApp (+91 8898134096)"
              className="w-13 h-13 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:bg-[#1da851] hover:scale-110 transition-all shadow-lg border border-black/10 group"
            >
              <svg className="w-6 h-6 fill-current group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </a>

            {/* Email Logo Circle */}
            <a
              href={`mailto:${data.about?.email || 'shwetank.sharma096@gmail.com'}`}
              title={`Email Me (${data.about?.email || 'shwetank.sharma096@gmail.com'})`}
              className="w-13 h-13 rounded-full bg-[#111111] text-white flex items-center justify-center hover:bg-black hover:scale-110 transition-all shadow-lg border border-black/20 group"
            >
              <Mail size={22} className="group-hover:rotate-12 transition-transform duration-300" />
            </a>

            {/* LinkedIn Logo Circle */}
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn Profile"
              className="w-13 h-13 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:bg-[#004182] hover:scale-110 transition-all shadow-lg border border-black/10 group"
            >
              <svg className="w-6 h-6 fill-current group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>

            {/* Instagram Logo Circle */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram Profile"
              className="w-13 h-13 rounded-full bg-[#E1306C] text-white flex items-center justify-center hover:bg-[#c13584] hover:scale-110 transition-all shadow-lg border border-black/10 group"
            >
              <svg className="w-6 h-6 fill-current group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>

            {/* Phone Call Logo Circle */}
            <a
              href={`tel:${data.about?.phone || '8898134096'}`}
              title={`Call +91 ${data.about?.phone || '8898134096'}`}
              className="w-13 h-13 rounded-full bg-white text-black border border-black/30 flex items-center justify-center hover:bg-black hover:text-white hover:scale-110 transition-all shadow-lg group"
            >
              <Phone size={22} className="group-hover:rotate-12 transition-transform duration-300" />
            </a>
          </div>
        </motion.div>

        {/* Location Box & Embedded Google Map */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#F4F4F6] border border-black/10 rounded-3xl p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#EAB308] bg-[#FFE600]/20 px-3 py-1 rounded-full border border-black/10">
                📍 OFFICIAL ADDRESS
              </span>
              <h3 className="font-extrabold text-2xl uppercase text-black mt-3">
                SHWETANK SHARMA
              </h3>
              <p className="text-sm text-black font-extrabold leading-snug mt-1">
                Kalyan, Mumbai, Maharashtra – 421301, India
              </p>
              <p className="text-xs text-black/70 font-normal leading-relaxed mt-2">
                {data.settings?.locationAddress || "Available for on-site brand account management across Mumbai Metropolitan Region (Kalyan, Thane, Mumbai) and remote brand campaigns globally."}
              </p>
            </div>

            <a
              href="https://maps.google.com/?q=Kalyan,+Mumbai,+Maharashtra+421301"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-5 rounded-2xl bg-[#111111] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#FFE600] hover:text-black transition shadow-md w-fit"
            >
              <span>Open Map Location</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Interactive Google Map Frame */}
          <div className="md:col-span-2 rounded-2xl overflow-hidden border border-black/15 shadow-inner h-[240px] w-full bg-white">
            <iframe
              title="Kalyan Mumbai Location Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60233.15530514107!2d73.10996167191195!3d19.243703901962386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be79633e2182c61%3A0x6b4474744417b189!2sKalyan%2C%20Maharashtra%20421301!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            />
          </div>
        </div>

        {/* Footer Bottom Line */}
        <div className="flex justify-between items-center border-t border-black/10 pt-6 text-xs font-mono font-bold text-black/50 uppercase tracking-widest">
          <span>Shwetank Sharma // Associate Account Manager</span>
          <span>© {new Date().getFullYear()} All Rights Reserved</span>
        </div>

      </div>
    </footer>
  );
};
