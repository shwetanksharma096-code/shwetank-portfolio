import React from 'react';
import { ExternalLink } from 'lucide-react';

interface LinkedInEmbedCardProps {
  id: string;
  badge: string;
  title: string;
  dateText: string;
  caption: string;
  hashtags: string[];
  postUrl: string;
  imageThumbnail?: string;
}

export const LinkedInEmbedCard: React.FC<LinkedInEmbedCardProps> = ({
  badge,
  title,
  dateText,
  caption,
  hashtags,
  postUrl,
  imageThumbnail
}) => {
  return (
    <div className="bg-white rounded-3xl border border-black/15 p-6 shadow-xl flex flex-col justify-between gap-5 relative overflow-hidden group hover:border-[#0A66C2] transition-all">
      {/* Top Header Strip */}
      <div className="flex items-center justify-between border-b border-black/10 pb-4">
        <div className="flex items-center gap-3">
          {/* LinkedIn Icon Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
            in
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-black uppercase tracking-wide">Shwetank Sharma</h4>
            <p className="text-[10px] font-mono font-semibold text-black/60">Associate Account Manager • {dateText}</p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#FFE600] text-black border border-black/20">
          {badge}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-3">
        <h3 className="font-extrabold text-lg text-black uppercase tracking-tight leading-snug">
          {title}
        </h3>

        <p className="text-xs text-black/80 font-normal leading-relaxed">
          {caption}
        </p>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          {hashtags.map((tag, i) => (
            <span key={i} className="text-[10px] font-mono font-bold text-[#0A66C2] bg-[#0A66C2]/10 px-2.5 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        {/* Thumbnail Preview Banner if available */}
        {imageThumbnail && (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-black/10 mt-2 bg-[#F4F4F6]">
            <img src={imageThumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                🏆 E4M Award Winning Campaign
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Action Button */}
      <a
        href={postUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 rounded-2xl bg-[#0A66C2] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#004182] transition shadow-md"
      >
        <span>View Original Post on LinkedIn</span>
        <ExternalLink size={14} />
      </a>
    </div>
  );
};
