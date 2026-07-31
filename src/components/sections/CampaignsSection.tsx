import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CircularGallery } from '../CircularGallery';
import { InfiniteMarquee } from '../InfiniteMarquee';


const getBrandLogo = (brandName: string, logos: { name: string; logoUrl: string }[]) => {
  const match = logos.find(
    (l) => l.name && brandName && l.name.toLowerCase().includes(brandName.toLowerCase().split(' ')[0])
  );
  if (match?.logoUrl) {
    return (
      <img
        src={match.logoUrl}
        alt={match.name}
        className="w-4 h-4 rounded object-contain mr-2 flex-shrink-0 bg-black/5"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
    );
  }
  return <div className="w-1.5 h-1.5 rounded-full bg-[#FFE600] border border-black mr-2 flex-shrink-0" />;
};

interface Creator {
  creator: string;
  profile: string;
  liveLink: string;
}

interface GroupedCampaigns {
  [brand: string]: {
    [campaign: string]: Creator[];
  };
}

interface CampaignsData {
  grouped: GroupedCampaigns;
  brands: string[];
  lastSync?: number;
}

interface BrandLogo {
  id: string;
  name: string;
  logoUrl: string;
}

interface CampaignsSectionProps {
  campaigns: CampaignsData;
  brandLogos?: BrandLogo[];
  onSelectVideo?: (video: any) => void;
  theme?: 'light' | 'dark';
}

function extractInstagramHandle(url: string | undefined): string {
  if (!url) return '';
  const m = url.match(/instagram\.com\/([^/?#]+)/);
  return m ? '@' + m[1] : '';
}

export const CampaignsSection: React.FC<CampaignsSectionProps> = ({ campaigns, brandLogos = [] }) => {
  const [activeBrandState, setActiveBrandState] = useState<string>('');
  const [openCampaignIdx, setOpenCampaignIdx] = useState<number | null>(null);

  const activeBrand = activeBrandState && campaigns.brands.includes(activeBrandState)
    ? activeBrandState
    : (campaigns.brands[0] || '');

  const selectBrand = (brand: string) => {
    setActiveBrandState(brand);
    setOpenCampaignIdx(null);
  };

  const galleryItems = [
    { image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop', text: 'PANTALOONS' },
    { image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop', text: 'THE RAYMOND SHOP' },
    { image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800&auto=format&fit=crop', text: 'RELIANCE TRENDS' },
    { image: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=800&auto=format&fit=crop', text: 'COLORPLUS' },
    { image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop', text: 'TRING INDIA' },
    { image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop', text: 'BIG BOSS' }
  ];

  return (
    <section id="campaigns" className="w-full bg-[#FFFFFF] text-[#111111] py-16 px-4 sm:px-8 md:px-12 font-sans border-b border-black/10">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-black/10 pb-6">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#FFE600] text-black">
              003. CAMPAIGNS & BRAND ACCOUNTS
            </span>
            <div className="flex items-baseline gap-3 mt-3">
              <h2 className="font-extrabold text-4xl sm:text-7xl uppercase tracking-tight text-black leading-none break-words">
                CAMPAIGNS & ACCOUNTS
              </h2>
            </div>
          </div>
        </div>

        {/* WEBGL CIRCULAR GALLERY SHOWCASE */}
        <div className="w-full h-[300px] sm:h-[400px] relative rounded-3xl overflow-hidden border border-black/10 bg-[#F4F4F6] shadow-lg">
          <CircularGallery
            items={galleryItems}
            bend={2.5}
            textColor="#111111"
            borderRadius={0.08}
            scrollEase={0.04}
            scrollSpeed={2}
          />
        </div>

        {/* Brand Logos Marquee Display */}
        {brandLogos && brandLogos.length > 0 && (
          <div className="bg-[#F4F4F6] border border-black/10 rounded-2xl py-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#F4F4F6] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#F4F4F6] to-transparent z-10 pointer-events-none" />
            <InfiniteMarquee direction="left" speed={1.1} gap="gap-0">
              {brandLogos.map((brand, idx) => (
                <div key={`l1-${brand.id}-${idx}`} className="flex-shrink-0 flex items-center justify-center px-8 py-2 opacity-80 hover:opacity-100 transition-opacity">
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt={brand.name} className="h-8 object-contain max-w-[120px]" />
                  ) : (
                    <span className="text-xs font-black uppercase tracking-wider text-black/80">{brand.name}</span>
                  )}
                </div>
              ))}
            </InfiniteMarquee>
          </div>
        )}

        {campaigns.brands && campaigns.brands.length > 0 ? (
          <div className="bg-[#F4F4F6] border border-black/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
            
            {/* Brand Filter Buttons */}
            {/* Brand Filter Buttons with Generous Spacing */}
            <div className="flex flex-wrap gap-3 sm:gap-3.5 py-2">
              {campaigns.brands.map(brand => {
                const logo = getBrandLogo(brand, brandLogos);
                const isActive = activeBrand === brand;
                return (
                  <button
                    type="button"
                    key={brand}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      selectBrand(brand);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.03] ${
                      isActive
                        ? 'bg-[#111111] text-white border-[#111111] shadow-md'
                        : 'bg-white text-black/80 border-black/15 hover:border-black hover:text-black'
                    }`}
                  >
                    {logo}
                    <span>{brand}</span>
                  </button>
                );
              })}
            </div>

            {/* Accordion Container */}
            <div className="border border-black/10 rounded-2xl overflow-hidden bg-white max-h-[60vh] overflow-y-auto scrollbar-thin">
              {Object.keys((campaigns && campaigns.grouped && activeBrand && campaigns.grouped[activeBrand]) || {}).map((campaignName, idx) => {
                const creators = (campaigns && campaigns.grouped && activeBrand && campaigns.grouped[activeBrand][campaignName]) || [];
                const isOpen = openCampaignIdx === idx;
                return (
                  <div key={idx} className="border-b border-black/10 last:border-b-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenCampaignIdx(isOpen ? null : idx);
                      }}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-black/5 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs transition-transform duration-300 text-black ${isOpen ? 'rotate-90 text-[#EAB308]' : ''}`}>
                          ▶
                        </span>
                        <span className="font-extrabold text-sm sm:text-base text-black uppercase tracking-wide">{campaignName}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-[#FFE600] text-black border border-black/20">
                        {creators.length} creator{creators.length !== 1 ? 's' : ''}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-black/10 p-5 max-h-[400px] overflow-y-auto scrollbar-thin bg-[#F9F9FB]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {creators.map((c: any, cidx: number) => {
                            const handle = extractInstagramHandle(c.profile);
                            return (
                              <div key={cidx} className="border border-black/10 rounded-xl p-4 flex flex-col justify-between gap-3 bg-white hover:border-black transition shadow-sm">
                                <div>
                                  <div className="font-bold text-sm text-black">{c.creator}</div>
                                  {handle && (
                                    <a
                                      href={c.profile}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs underline mt-0.5 inline-block font-mono text-black/60 hover:text-black font-semibold"
                                    >
                                      {handle}
                                    </a>
                                  )}
                                </div>
                                {c.liveLink && (
                                  <a
                                    href={c.liveLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    className="w-full py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition flex items-center justify-center gap-1 bg-[#111111] text-white hover:bg-[#FFE600] hover:text-black shadow-sm"
                                  >
                                    <span>View Live Post</span> <ArrowUpRight size={12} />
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-[#F4F4F6] border border-black/10 rounded-2xl p-8 text-center text-xs font-mono text-black/40">
            No live campaigns loaded. Connect a campaign Google Sheet link in the Admin panel.
          </div>
        )}
      </div>
    </section>
  );
};
