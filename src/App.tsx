import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { getData, getInstagramId, defaultData, parseCampaignCsv } from './lib/store';
import { AdminPage } from './components/AdminPage';
import { AdminLoginGate } from './components/AdminLoginGate';
import { LoadingScreen } from './components/LoadingScreen';
import { ScrollProgressBar } from './components/ScrollProgressBar';

// Section Components
import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { CampaignsSection } from './components/sections/CampaignsSection';
import { AchievementsSection } from './components/sections/AchievementsSection';
import { ExperienceSection } from './components/sections/ExperienceSection';
import { SkillsSection } from './components/sections/SkillsSection';
import { FooterSection } from './components/sections/FooterSection';

import './App.css';

function MainApp() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<typeof defaultData>(() => getData());
  const [campaigns, setCampaigns] = useState<{ grouped: any; brands: string[] }>({ grouped: {}, brands: [] });
  const [lightbox, setLightbox] = useState<any>(null);

  const handleSelectVideo = (video: any) => {
    if (!video || !video.url) return;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const instaId = getInstagramId(video.url);
    if (isMobile && instaId) {
      const isReel = video.url.includes('/reel/') || video.url.includes('/reels/');
      const deepLink = `https://www.instagram.com/_n/${isReel ? 'reel' : 'p'}/${instaId}/`;
      const link = document.createElement('a');
      link.href = deepLink;
      link.target = '_self';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setLightbox(video);
    }
  };

  // Load data on mount
  useEffect(() => {
    // 1. Initial synchronous load from local storage to prevent flicker
    const stored = getData() as any;
    setData(stored);

    // 2. Async load from global KV database
    import('./lib/store').then(({ fetchGlobalData, saveData }) => {
      fetchGlobalData().then((globalData) => {
        if (globalData) {
          setData(globalData);
          saveData(globalData); // Sync local cache
        }
      });
    });

    // Load cached campaign data instantly (from localStorage)
    if (stored._campaignsCache?.brands?.length > 0) {
      setCampaigns({ grouped: stored._campaignsCache.grouped, brands: stored._campaignsCache.brands });
    }

    // Refresh campaign CSV directly from Google Sheets in background
    const sheetUrl = stored.campaigns?.sheetUrl;
    if (sheetUrl) {
      let csvUrl = sheetUrl;
      if (csvUrl.includes('docs.google.com/spreadsheets') && !csvUrl.includes('export?format=csv')) {
        csvUrl = csvUrl.split('/edit')[0].split('/pub')[0] + '/export?format=csv';
      }
      fetch(csvUrl)
        .then(r => r.ok ? r.text() : Promise.reject(r.status))
        .then(csvText => {
          const { grouped, brands } = parseCampaignCsv(csvText);
          if (brands.length > 0) setCampaigns({ grouped, brands });
        })
        .catch(err => console.warn('Campaigns CSV fetch failed:', err));
    }
  }, []);

  // Sync data across tabs instantly when localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shwetank_portfolio_v1' && e.newValue) {
        try {
          setData(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Storage sync error:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightbox) {
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
  }, [lightbox]);

  // Global click ripple effect — desktop only
  useEffect(() => {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isMobile) return; // Skip on mobile — not worth the DOM cost

    const handleClick = (e: MouseEvent) => {
      const el = document.createElement('span');
      el.className = 'global-click-ripple';
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 700);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Content Protection: Disable Right-click, Copy Shortcuts, Save, Dragging & Inspect Element
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Copy: Cmd+C or Ctrl+C
      if (cmdOrCtrl && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
      }
      // Cut: Cmd+X or Ctrl+X
      if (cmdOrCtrl && (e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
      }
      // View Source: Cmd+U or Ctrl+U
      if (cmdOrCtrl && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
      }
      // Save Page: Cmd+S or Ctrl+S
      if (cmdOrCtrl && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }
      // Inspect: F12, Ctrl+Shift+I, Ctrl+Shift+J
      if (
        e.key === 'F12' ||
        (cmdOrCtrl && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J'))
      ) {
        e.preventDefault();
      }
    };

    const handleDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dragstart', handleDragStart);
    };
  }, []);


  return (
    <div className="text-[#111111] font-sans overflow-x-clip min-h-screen w-full relative select-none" style={{ background: '#FFFFFF' }}>

      <AnimatePresence>
        {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      </AnimatePresence>

      <div
        className={`transition-opacity duration-500 ease-in-out ${loaded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ visibility: loaded ? 'visible' : 'hidden' }}
      >
        <ScrollProgressBar />
        <div className="film-grain" aria-hidden="true" />

        <HeroSection data={data} />

        {data.about?.bio || data.about?.photoUrl ? (
          <AboutSection data={data} />
        ) : null}

        {campaigns.brands && campaigns.brands.length > 0 ? (
          <CampaignsSection
            campaigns={campaigns}
            brandLogos={(data as any).brandLogos || []}
            onSelectVideo={handleSelectVideo}
          />
        ) : null}

        <AchievementsSection achievements={(data as any).achievements || []} />

        {data.experience && data.experience.length > 0 ? (
          <ExperienceSection experience={data.experience} />
        ) : null}

        {data.skills && data.skills.length > 0 ? (
          <SkillsSection 
            skills={data.skills}
            languages={(data.settings as any)?.languages}
            location={(data.settings as any)?.skillsLocation}
          />
        ) : null}

        <FooterSection data={data} />
      </div>
    </div>
  );
}

function App() {
  if (window.location.pathname === '/admin') {
    return (
      <AdminLoginGate>
        <AdminPage />
      </AdminLoginGate>
    );
  }
  return <MainApp />;
}

export default App;
