import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  getData,
  saveData,
  saveGlobalData,
  resetData,
  parseCampaignCsv,
  getYoutubeId,
  defaultData
} from '../lib/store';
import { ImageUpload } from './ImageUpload';
import { deleteImageByUrl } from '../lib/storage';


const uid = () => Math.random().toString(36).slice(2, 9);

const NAV = [
  { id: 'stats',        icon: '📝', label: 'Hero Editor'    },
  { id: 'about',       icon: '👤', label: 'About'          },
  { id: 'campaigns',   icon: '📋', label: 'Campaigns'      },
  { id: 'brand-logos', icon: '🏷️', label: 'Brand Logos'    },
  { id: 'videos',      icon: '🎬', label: 'Video Projects' },
  { id: 'websites',    icon: '🌐', label: 'Websites Built' },
  { id: 'experience',  icon: '💼', label: 'Experience'     },
  { id: 'achievements',icon: '🏆', label: 'Achievements'   },
  { id: 'skills',      icon: '🛠️', label: 'Skills'         },
  { id: 'settings',    icon: '⚙️', label: 'Settings'       },
  { id: 'seed',        icon: '🗄️', label: 'Seed Data'      },
];

const SortableNavItem = ({ id, label, icon, active, onClick }: { id: string, label: string, icon: string, active: boolean, onClick: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center w-full relative group">
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-white/20 hover:text-white/60 transition opacity-0 group-hover:opacity-100 md:opacity-100"
      >
        <span className="text-[10px]">⋮⋮</span>
      </div>

      <button
        onClick={onClick}
        className={`flex-1 flex items-center gap-2 md:gap-3 px-3 py-2 md:p-3 md:pl-8 rounded-lg md:rounded-l-none md:rounded-r-lg text-xs md:text-sm transition text-left border-b-2 md:border-b-0 md:border-l-2 shrink-0 ${active ? 'bg-[#FFE600] text-black font-extrabold border-[#FFE600]' : 'text-white/70 hover:bg-white/10 hover:text-white border-transparent'}`}
      >
        <span>{icon}</span>
        {label}
      </button>
    </div>
  );
};
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return <div className="p-10 text-red-500 bg-black min-h-screen"><h1 className="text-2xl font-bold">Error in AdminPage</h1><pre className="mt-4 text-xs whitespace-pre-wrap">{this.state.error?.stack}</pre></div>;
    }
    return this.props.children;
  }
}

export const AdminPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <AdminPageInner />
    </ErrorBoundary>
  );
};

const AdminPageInner: React.FC = () => {
  const [tab, setTab] = useState('stats');
  const [data, setData] = useState<typeof defaultData>(() => getData());
  const [saved, setSaved] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const currentOrder = data.settings?.sectionOrder || ['about', 'services', 'campaigns', 'videos', 'websites', 'experience', 'skills', 'reviews'];

  useEffect(() => {
    setIsMounted(true);
    // Load from localStorage only — no Firebase
    setData(getData());
  }, []);

  if (!isMounted) return <div style={{ minHeight: '100vh', background: '#0C0C0C' }} />;



  const flash = (msg = 'Changes saved!') => {
    setSaved(msg);
    setTimeout(() => setSaved(''), 2500);
  };

  const save = async (section: string, val: any) => {
    const updated = { ...data, [section]: val };
    setData(updated);
    saveData(updated);
    flash('Saving... ⏳');
    const success = await saveGlobalData(updated);
    if (success) {
      flash('Saved Globally! ✅');
    } else {
      flash('Saved locally ⚠️ (Cloud sync failed)');
    }
  };

  const saveCampaigns = async (sheetUrl: string) => {
    try {
      // Normalise URL to CSV export format
      let csvUrl = sheetUrl;
      if (csvUrl.includes('docs.google.com/spreadsheets') && !csvUrl.includes('export?format=csv')) {
        csvUrl = csvUrl.split('/edit')[0].split('/pub')[0] + '/export?format=csv';
      }
      // Save the sheet URL to localStorage
      save('campaigns', { sheetUrl });

      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const csvText = await res.text();
      const { grouped, brands } = parseCampaignCsv(csvText);

      if (brands.length === 0) throw new Error('No data found in sheet — check column headers.');

      // Cache parsed campaign data in localStorage for instant display
      const existing = getData();
      saveData({ ...existing, campaigns: { sheetUrl }, _campaignsCache: { grouped, brands, lastSync: Date.now() } } as any);

      flash(`✅ Sheet saved! ${brands.length} brand(s) loaded.`);
    } catch (err: any) {
      console.error('Sync error:', err);
      flash(`❌ Error: ${err.message}`);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = currentOrder.indexOf(active.id as string);
      const newIndex = currentOrder.indexOf(over.id as string);
      const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
      const newSettings = { ...data.settings, sectionOrder: newOrder };
      const updated = { ...data, settings: newSettings };
      setData(updated);
      saveData(updated);
      flash('Layout order saved!');
    }
  };

  const renderNavItem = (n: typeof NAV[0]) => {
    if (!n) return null;
    return (
      <button
        key={n.id}
        onClick={() => setTab(n.id)}
        className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:p-3 md:pl-8 rounded-lg md:rounded-l-none md:rounded-r-lg text-xs md:text-sm transition text-left border-b-2 md:border-b-0 md:border-l-2 shrink-0 ${tab === n.id ? 'bg-[#FFE600] text-black font-extrabold border-[#FFE600]' : 'text-white/70 hover:bg-white/10 hover:text-white border-transparent'}`}
      >
        <span>{n.icon}</span>
        {n.label}
      </button>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-[#FFFFFF] text-[#111111] font-sans overflow-hidden">
      <aside className="w-full md:w-64 bg-[#111111] text-white border-b md:border-b-0 md:border-r border-black/10 flex flex-col justify-between h-auto md:h-full z-30 shrink-0">
        <div className="p-4 md:p-6 flex flex-col gap-3 md:gap-0">
          <div className="flex justify-between items-center">
            <div className="text-lg md:text-xl font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600]" />
              SHWETANK<span className="text-[#FFE600]">.</span> ADMIN
            </div>
            {/* Logout button on mobile header */}
            <button
              onClick={() => { sessionStorage.removeItem('shwetank_admin_auth'); window.location.reload(); }}
              className="md:hidden px-3 py-1.5 bg-[#FFE600] text-black rounded-lg text-[10px] uppercase tracking-wider font-extrabold hover:bg-white transition"
            >
              Logout
            </button>
          </div>
          
          <nav className="flex flex-row md:flex-col gap-1.5 md:gap-1 mt-2 md:mt-8 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none whitespace-nowrap w-full">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 md:mb-1 md:ml-3 hidden md:block">Pinned</div>
            {renderNavItem(NAV.find(n => n.id === 'stats')!)}
            {renderNavItem(NAV.find(n => n.id === 'brand-logos')!)}
            
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 md:mt-4 md:mb-1 md:ml-3 hidden md:block">Website Order</div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={currentOrder} strategy={verticalListSortingStrategy}>
                {currentOrder.map(id => {
                  const n = NAV.find(item => item.id === id);
                  if (!n) return null;
                  return (
                    <SortableNavItem 
                      key={n.id} 
                      id={n.id} 
                      label={n.label} 
                      icon={n.icon} 
                      active={tab === n.id} 
                      onClick={() => setTab(n.id)} 
                    />
                  );
                })}
              </SortableContext>
            </DndContext>

            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 md:mt-4 md:mb-1 md:ml-3 hidden md:block">System</div>
            {renderNavItem(NAV.find(n => n.id === 'settings')!)}
            {renderNavItem(NAV.find(n => n.id === 'seed')!)}
          </nav>
        </div>
        {/* Logout button on desktop footer */}
        <div className="hidden md:block p-6 border-t border-white/10">
          <button
            onClick={() => { sessionStorage.removeItem('shwetank_admin_auth'); window.location.reload(); }}
            className="w-full p-3 bg-[#FFE600] text-black rounded-lg text-xs uppercase tracking-widest font-extrabold hover:bg-white transition shadow-md"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 sm:p-10 w-full max-w-[1400px] mx-auto overflow-y-auto overflow-x-hidden min-h-0 scrollbar-thin bg-[#FFFFFF]">
        {saved && (
          <div className="fixed top-6 right-6 bg-[#FFE600] text-black font-extrabold py-2.5 px-6 rounded-xl shadow-xl z-50 text-xs uppercase tracking-wider border border-black/20">
            {saved}
          </div>
        )}

        {tab === 'stats'        && <HeroSettings   data={data} save={save} />}
        {tab === 'campaigns'    && <Campaigns      data={data} saveCampaigns={saveCampaigns} />}
        {tab === 'brand-logos'  && <BrandLogosManagement data={data} save={save} />}
        {tab === 'videos'       && <VideoProjects  data={data} save={save} flash={flash} />}
        {tab === 'websites'     && <WebsitesManagement data={data} save={save} />}
        {tab === 'experience'   && <Experience     data={data} save={save} />}
        {tab === 'achievements' && <AchievementsManagement data={data} save={save} />}
        {tab === 'skills'       && <Skills         data={data} save={save} />}
        {tab === 'about'        && <About          data={data} save={save} />}
        {tab === 'settings'     && <Settings       data={data} save={save} />}
        {tab === 'seed'         && <SeedData       setData={setData} flash={flash} />}
      </main>
    </div>
  );
};

// ── HERO SETTINGS SUBCOMPONENT ──

const HeroSettings: React.FC<{ data: typeof defaultData; save: (s: string, v: any) => void }> = ({ data, save }) => {
  const [form, setForm] = useState({ ...((data as any).hero || {}) });

  useEffect(() => {
    setForm({ ...((data as any).hero || {}) });
  }, [(data as any).hero]);

  const setVal = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Hero Editor</h2>
      <p className="text-sm text-[#111111]/50 mb-6 font-sans">Edit the main headline and tags on your homepage.</p>
      
      <div className="flex flex-col gap-5 mb-8 bg-[#F4F4F6] border border-black/10 p-6 rounded-2xl">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Top Tag (Yellow Pill)</label>
          <input
            className="bg-white border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#111111] w-full"
            value={form.topTag || ''}
            onChange={e => setVal('topTag', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Awards Tag (Black Pill)</label>
          <input
            className="bg-white border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#111111] w-full"
            value={form.awardsTag || ''}
            onChange={e => setVal('awardsTag', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Headline Part 1</label>
          <input
            className="bg-white border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#111111] w-full font-bold uppercase"
            value={form.headlinePart1 || ''}
            onChange={e => setVal('headlinePart1', e.target.value.toUpperCase())}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Highlight Text</label>
            <input
              className="bg-white border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#111111] w-full font-bold uppercase"
              value={form.headlineHighlight || ''}
              onChange={e => setVal('headlineHighlight', e.target.value.toUpperCase())}
            />
          </div>
          <div className="flex flex-col gap-1 w-[120px]">
            <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Color</label>
            <input
              type="color"
              className="bg-white border border-black/10 rounded-lg px-1 py-1 h-[44px] w-full cursor-pointer"
              value={form.headlineHighlightColor || '#EAB308'}
              onChange={e => setVal('headlineHighlightColor', e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Headline Part 2</label>
          <input
            className="bg-white border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#111111] w-full font-bold uppercase"
            value={form.headlinePart2 || ''}
            onChange={e => setVal('headlinePart2', e.target.value.toUpperCase())}
          />
        </div>
      </div>

      {/* Legacy Social Links that were in HeroStats */}
      <div className="flex flex-col gap-4 bg-[#F4F4F6] border border-black/10 p-6 rounded-2xl mb-8">
        <h3 className="font-bold text-lg mb-2">Social Links</h3>
        {['instagramUrl', 'linkedinUrl', 'youtubeUrl'].map(key => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">{key.replace('Url', '')} URL</label>
            <input
              className="bg-white border border-black/10 rounded-lg p-3 text-sm text-[#111111]"
              value={(form as any)[key] || ''}
              onChange={e => setVal(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button onClick={() => save('hero', form)} className="bg-[#FFE600] px-6 py-3 rounded-lg font-semibold uppercase tracking-widest text-xs hover:bg-yellow-300 transition shadow-lg shadow-black/10">
        Save Hero Settings
      </button>
    </div>
  );
};

// ─── CAMPAIGNS SUBCOMPONENT ─────────────────────────────────────────

const Campaigns: React.FC<{ data: typeof defaultData; saveCampaigns: (s: string) => void }> = ({ data, saveCampaigns }) => {
  const [url, setUrl] = useState((data.campaigns || {}).sheetUrl || '');

  useEffect(() => {
    setUrl((data.campaigns || {}).sheetUrl || '');
  }, [data.campaigns]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Campaigns</h2>
      <div className="bg-[#F4F4F6] border border-black/10 p-6 rounded-xl mb-6">
        <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1 block mb-2">Google Sheet CSV URL</label>
        <input
          className="w-full bg-white border border-black/10 rounded-lg p-3 text-[#111111] text-sm mb-4"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button onClick={() => saveCampaigns(url)} className="bg-[#FFE600] px-6 py-3 rounded-lg font-semibold uppercase tracking-widest text-xs hover:bg-yellow-300 transition shadow-lg shadow-black/10">
          Save &amp; Sync Data
        </button>
      </div>
    </div>
  );
};

// ─── DND SORTABLE PROJECT COMPONENT ─────────────────────────────────

const SortableProject: React.FC<{
  p: typeof defaultData.videoProjects[0];
  openManage: (p: any) => void;
  openEdit: (p: any) => void;
  deleteProject: (id: string) => void;
}> = ({ p, openManage, openEdit, deleteProject }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: p.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-[#F4F4F6] border border-black/10 p-5 rounded-xl flex flex-col gap-4 mb-4">
      <div className="flex items-start gap-4">
        <div {...attributes} {...listeners} className="cursor-grab text-[#111111]/40 hover:text-[#111111] text-lg select-none">
          ☰
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(p.tags || []).map(t => <span key={t} className="text-[10px] bg-[#FFE600]/20 text-[#111111] border border-[#FFE600]/40 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">{t}</span>)}
          </div>
          <h3 className="font-bold text-lg text-[#111111]">{p.title}</h3>
          <p className="text-xs text-[#111111]/60 mt-1">{p.description}</p>
          <span className="text-[10px] text-[#111111]/70 uppercase tracking-widest font-semibold mt-2 block">{(p.videos || []).length} video(s)</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-black/10 pt-4">
        <button onClick={() => openManage(p)} className="bg-[#F0F0F2] border border-black/10 px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-semibold hover:bg-black/10 transition">Manage Videos</button>
        <button onClick={() => openEdit(p)} className="bg-[#F0F0F2] border border-black/10 px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-semibold hover:bg-black/10 transition">Edit Details</button>
        <button onClick={() => deleteProject(p.id)} className="bg-red-950/20 border border-red-900/30 text-red-400 px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-semibold hover:bg-red-950/40 transition">Delete</button>
      </div>
    </div>
  );
};

// ─── VIDEO PROJECTS SUBCOMPONENT ───────────────────────────────────

const VideoProjects: React.FC<{
  data: typeof defaultData;
  save: (s: string, v: any) => void;
  flash: (m?: string) => void;
}> = ({ data, save, flash }) => {
  const [projects, setProjects] = useState<typeof defaultData.videoProjects>([]);
  const [modal, setModal] = useState<{ type: 'project' | 'videos'; isEdit?: boolean; id?: string } | null>(null);
  const [form, setForm] = useState({ title: '', description: '', tags: '' });
  const [manageProject, setManageProject] = useState<any>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoThumbnailUrl, setNewVideoThumbnailUrl] = useState('');
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editVideoTitle, setEditVideoTitle] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editVideoThumbnailUrl, setEditVideoThumbnailUrl] = useState('');
  const [fetchingTitles, setFetchingTitles] = useState(false);

  useEffect(() => {
    const list = data.videoProjects || [];
    setProjects(list);
    if (manageProject) {
      const fresh = list.find(p => p.id === manageProject.id);
      if (fresh) setManageProject(fresh);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.videoProjects]);

  // Auto fetch title for new video input
  useEffect(() => {
    const ytid = getYoutubeId(newVideoUrl);
    if (ytid) {
      const fetchTitle = async () => {
        try {
          const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(newVideoUrl)}&format=json`;
          const res = await fetch(oembedUrl);
          if (res.ok) {
            const data = await res.json();
            if (data.title && !newVideoTitle) {
              setNewVideoTitle(data.title);
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchTitle();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newVideoUrl]);

  // Auto fetch title for edit input
  useEffect(() => {
    const ytid = getYoutubeId(editVideoUrl);
    if (ytid && editingVideoId) {
      const fetchTitle = async () => {
        try {
          const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(editVideoUrl)}&format=json`;
          const res = await fetch(oembedUrl);
          if (res.ok) {
            const data = await res.json();
            if (data.title) {
              setEditVideoTitle(data.title);
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchTitle();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editVideoUrl]);

  const persist = (updated: typeof defaultData.videoProjects) => {
    setProjects(updated);
    save('videoProjects', updated);
  };

  const openAdd = () => {
    setForm({ title: '', description: '', tags: '' });
    setModal({ type: 'project', isEdit: false });
  };

  const openEdit = (p: any) => {
    setForm({ title: p.title, description: p.description, tags: (p.tags || []).join(', ') });
    setModal({ type: 'project', isEdit: true, id: p.id });
  };

  const saveProject = () => {
    const tagsArr = (form.tags || '').split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
    if (modal?.isEdit) {
      persist(projects.map(p => p.id === modal.id ? { ...p, title: form.title, description: form.description, tags: tagsArr } : p));
    } else {
      persist([...projects, { id: uid(), title: form.title, description: form.description, tags: tagsArr, videos: [] }]);
    }
    setModal(null);
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete project?')) return;
    
    // Find project and delete all its video thumbnails from Storage
    const projectToDelete = projects.find(p => p.id === id);
    if (projectToDelete && projectToDelete.videos) {
      for (const v of projectToDelete.videos as any[]) {
        if (v.thumbnailUrl) {
          try {
            await deleteImageByUrl(v.thumbnailUrl);
          } catch (err) {
            console.warn("Failed to delete video thumbnail from storage on project delete:", err);
          }
        }
      }
    }

    persist(projects.filter(p => p.id !== id));
  };

  const openManage = (p: any) => {
    setManageProject({ ...p });
    setModal({ type: 'videos' });
    setNewVideoUrl('');
    setNewVideoTitle('');
    setNewVideoThumbnailUrl('');
    setEditingVideoId(null);
  };

  const addVideo = () => {
    if (!newVideoUrl) return;
    const vid = { 
      id: uid(), 
      url: newVideoUrl.trim(), 
      title: newVideoTitle.trim() || 'Untitled',
      thumbnailUrl: newVideoThumbnailUrl.trim()
    };
    const updated = { ...manageProject, videos: [...(manageProject.videos || []), vid] };
    setManageProject(updated);
    persist(projects.map(p => p.id === updated.id ? updated : p));
    setNewVideoUrl('');
    setNewVideoTitle('');
    setNewVideoThumbnailUrl('');
  };

  const startVideoEdit = (v: any) => {
    setEditingVideoId(v.id);
    setEditVideoTitle(v.title);
    setEditVideoUrl(v.url);
    setEditVideoThumbnailUrl(v.thumbnailUrl || '');
  };

  const cancelVideoEdit = () => {
    setEditingVideoId(null);
    setEditVideoThumbnailUrl('');
  };

  const saveVideoEdit = (vidId: string) => {
    if (!editVideoUrl) return;
    const updated = (manageProject.videos || []).map((v: any) =>
      v.id === vidId ? { ...v, title: editVideoTitle, url: editVideoUrl, thumbnailUrl: editVideoThumbnailUrl } : v
    );
    const updatedProj = { ...manageProject, videos: updated };
    setManageProject(updatedProj);
    persist(projects.map(p => p.id === updatedProj.id ? updatedProj : p));
    cancelVideoEdit();
  };

  const deleteVideo = async (vidId: string) => {
    const videoToDelete = (manageProject.videos || []).find((v: any) => v.id === vidId);
    if (videoToDelete?.thumbnailUrl) {
      try {
        await deleteImageByUrl(videoToDelete.thumbnailUrl);
      } catch (err) {
        console.warn("Failed to delete video thumbnail from storage on delete:", err);
      }
    }

    const updated = (manageProject.videos || []).filter((v: any) => v.id !== vidId);
    const updatedProj = { ...manageProject, videos: updated };
    setManageProject(updatedProj);
    persist(projects.map(p => p.id === updatedProj.id ? updatedProj : p));
  };


  const fetchAllTitles = async () => {
    if (!manageProject.videos || manageProject.videos.length === 0) return;
    setFetchingTitles(true);
    try {
      const updated = await Promise.all(
        manageProject.videos.map(async (v: any) => {
          const ytid = getYoutubeId(v.url);
          if (ytid) {
            try {
              const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(v.url)}&format=json`;
              const res = await fetch(oembedUrl);
              if (res.ok) {
                const json = await res.json();
                if (json.title) return { ...v, title: json.title };
              }
            } catch (e) {
              console.error(e);
            }
          }
          return v;
        })
      );
      const updatedProj = { ...manageProject, videos: updated };
      setManageProject(updatedProj);
      persist(projects.map(p => p.id === updatedProj.id ? updatedProj : p));
      flash('Titles successfully updated! 🚀');
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingTitles(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = projects.findIndex(p => p.id === active.id);
      const newIdx = projects.findIndex(p => p.id === over.id);
      persist(arrayMove(projects, oldIdx, newIdx));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Video Projects</h2>
        <button onClick={openAdd} className="bg-[#FFE600] text-black font-semibold py-2 px-4 rounded-lg uppercase tracking-wider text-xs hover:bg-yellow-300 transition shadow-lg shadow-black/10">
          + Add Project
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map(p => (
            <SortableProject key={p.id} p={p} openManage={openManage} openEdit={openEdit} deleteProject={deleteProject} />
          ))}
        </SortableContext>
      </DndContext>

      {/* PROJECT DETAILS MODAL */}
      {modal?.type === 'project' && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 sm:p-6 z-50">
          <div className="bg-[#F4F4F6] border border-black/10 p-5 sm:p-8 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">{modal.isEdit ? 'Edit Project' : 'Add Project'}</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Title</label>
                <input
                  className="bg-white border border-black/10 rounded-lg p-3 text-[#111111] text-sm"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Description</label>
                <input
                  className="bg-white border border-black/10 rounded-lg p-3 text-[#111111] text-sm"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Tags (comma separated)</label>
                <input
                  className="bg-white border border-black/10 rounded-lg p-3 text-[#111111] text-sm"
                  value={form.tags}
                  onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-lg border border-black/15 uppercase text-xs tracking-wider">Cancel</button>
              <button onClick={saveProject} className="px-5 py-2.5 rounded-lg bg-[#FFE600] uppercase text-xs tracking-wider font-semibold hover:bg-yellow-300">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEOS LIST MODAL */}
      {modal?.type === 'videos' && manageProject && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 sm:p-6 z-50">
          <div className="bg-[#F4F4F6] border border-black/10 p-5 sm:p-8 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Manage Videos — {manageProject.title}</h3>
            
            {manageProject.videos && manageProject.videos.length > 0 && (
              <button
                disabled={fetchingTitles}
                onClick={fetchAllTitles}
                className="w-full bg-[#F0F0F2] border border-black/10 text-[#111111] p-3 text-xs uppercase tracking-widest font-semibold rounded-lg mb-6 hover:bg-black/10 transition"
              >
                {fetchingTitles ? 'Fetching titles...' : 'Fetch All YouTube Titles'}
              </button>
            )}

            <div className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto mb-6">
              {(manageProject.videos || []).map((v: any) => {
                const isEditing = editingVideoId === v.id;
                const ytid = getYoutubeId(v.url);

                if (isEditing) {
                  return (
                    <div key={v.id} className="flex flex-col gap-4 bg-white border border-black/10 p-4 rounded-lg">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 flex flex-col gap-1">
                          <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Title</label>
                          <input
                            className="w-full bg-[#F4F4F6] border border-black/10 rounded p-2 text-xs text-[#111111]"
                            value={editVideoTitle}
                            onChange={e => setEditVideoTitle(e.target.value)}
                          />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">URL</label>
                          <input
                            className="w-full bg-[#F4F4F6] border border-black/10 rounded p-2 text-xs text-[#111111]"
                            value={editVideoUrl}
                            onChange={e => setEditVideoUrl(e.target.value)}
                          />
                        </div>
                      </div>
                      <ImageUpload
                        value={editVideoThumbnailUrl}
                        onChange={setEditVideoThumbnailUrl}
                        folderPath="thumbnails"
                        label="Custom Thumbnail Override (Optional)"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => saveVideoEdit(v.id)} className="bg-[#FFE600] px-3 py-1.5 text-xs rounded hover:bg-yellow-300 font-semibold uppercase tracking-wider flex items-center gap-1">💾 Save Edit</button>
                        <button onClick={cancelVideoEdit} className="bg-neutral-800 px-3 py-1.5 text-xs rounded hover:bg-neutral-700 font-semibold uppercase tracking-wider">Cancel</button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={v.id} className="flex items-center gap-3 bg-white border border-black/10 p-3 rounded-lg">
                    {v.thumbnailUrl ? (
                      <img src={v.thumbnailUrl} className="w-12 h-8 object-cover rounded" alt="" />
                    ) : ytid ? (
                      <img src={`https://img.youtube.com/vi/${ytid}/default.jpg`} className="w-12 h-8 object-cover rounded" alt="" />
                    ) : (
                      <div className="w-12 h-8 bg-[#222] rounded" />
                    )}
                    <span className="flex-1 text-sm font-medium truncate">{v.title}</span>
                    <button onClick={() => startVideoEdit(v)} className="text-[#111111]/50 hover:text-[#111111]">✏️</button>
                    <button onClick={() => deleteVideo(v.id)} className="text-red-500 hover:text-red-400">🗑</button>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-black/10 pt-6">
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Add New Video</h4>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Video URL</label>
                  <input
                    className="bg-white border border-black/10 rounded-lg p-3 text-[#111111] text-sm"
                    value={newVideoUrl}
                    onChange={e => setNewVideoUrl(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Title</label>
                  <input
                    className="bg-white border border-black/10 rounded-lg p-3 text-[#111111] text-sm"
                    value={newVideoTitle}
                    onChange={e => setNewVideoTitle(e.target.value)}
                  />
                </div>
                <ImageUpload
                  value={newVideoThumbnailUrl}
                  onChange={setNewVideoThumbnailUrl}
                  folderPath="thumbnails"
                  label="Custom Thumbnail Override (Optional)"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-lg border border-black/15 uppercase text-xs tracking-wider">Close</button>
                <button onClick={addVideo} className="px-5 py-2.5 rounded-lg bg-[#FFE600] uppercase text-xs tracking-wider font-semibold hover:bg-yellow-300">Add Video</button>
              </div>
            </div>


          </div>
        </div>
      )}

    </div>
  );
};

// ─── EXPERIENCE SUBCOMPONENT ────────────────────────────────────────

const Experience: React.FC<{ data: typeof defaultData; save: (s: string, v: any) => void }> = ({ data, save }) => {
  const [items, setItems] = useState<typeof defaultData.experience>([]);
  const [modal, setModal] = useState<{ isEdit: boolean; id?: string } | null>(null);
  const [form, setForm] = useState({ year: '', role: '', company: '', description: '' });

  useEffect(() => {
    setItems(data.experience || []);
  }, [data.experience]);

  const persist = (updated: typeof defaultData.experience) => {
    setItems(updated);
    save('experience', updated);
  };

  const openAdd = () => {
    setForm({ year: '', role: '', company: '', description: '' });
    setModal({ isEdit: false });
  };

  const openEdit = (item: any) => {
    setForm({ ...item });
    setModal({ isEdit: true, id: item.id });
  };

  const saveItem = () => {
    if (modal?.isEdit) {
      persist(items.map(i => i.id === modal.id ? { ...i, ...form } : i));
    } else {
      persist([...items, { id: uid(), ...form }]);
    }
    setModal(null);
  };

  const deleteItem = (id: string) => {
    if (!confirm('Delete entry?')) return;
    persist(items.filter(i => i.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Experience</h2>
        <button onClick={openAdd} className="bg-[#FFE600] text-black font-semibold py-2 px-4 rounded-lg uppercase tracking-wider text-xs hover:bg-yellow-300 transition shadow-lg shadow-black/10">
          + Add Entry
        </button>
      </div>

      {/* Mobile Card List */}
      <div className="sm:hidden flex flex-col gap-3 mb-8">
        {items.map(item => (
          <div key={item.id} className="bg-[#F4F4F6] border border-black/10 p-4 rounded-xl flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1 font-semibold">{item.year}</span>
                <h3 className="font-bold text-[#111111] text-base mt-0.5">{item.role}</h3>
                <p className="text-xs text-[#111111]/60">{item.company}</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => openEdit(item)} className="text-xs text-[#111111]/50 hover:text-[#111111] font-semibold">Edit</button>
                <button onClick={() => deleteItem(item.id)} className="text-xs text-red-500 hover:text-red-400 font-semibold">Delete</button>
              </div>
            </div>
            {item.description && (
              <p className="text-xs text-[#111111]/50 border-t border-black/10 pt-2 mt-1 leading-relaxed">{item.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Desktop/Tablet Table */}
      <div className="hidden sm:block bg-[#F4F4F6] border border-black/10 rounded-xl overflow-hidden mb-8 w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-black/10 bg-[#F0F0F2] text-[#111111]/40 text-xs uppercase tracking-wider">
              <th className="p-4">Period</th>
              <th className="p-4">Role</th>
              <th className="p-4">Company</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-black/10 hover:bg-black/5 transition">
                <td className="p-4 text-[#111111]/60">{item.year}</td>
                <td className="p-4 font-semibold">{item.role}</td>
                <td className="p-4 text-[#111111]/60">{item.company}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="text-xs text-[#111111]/50 hover:text-[#111111] font-semibold">Edit</button>
                    <button onClick={() => deleteItem(item.id)} className="text-xs text-red-500 hover:text-red-400 font-semibold">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 sm:p-6 z-50">
          <div className="bg-[#F4F4F6] border border-black/10 p-5 sm:p-8 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">{modal.isEdit ? 'Edit Entry' : 'Add Entry'}</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Year / Period</label>
                <input
                  className="bg-white border border-black/10 rounded-lg p-3 text-[#111111] text-sm"
                  value={form.year}
                  onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Role</label>
                <input
                  className="bg-white border border-black/10 rounded-lg p-3 text-[#111111] text-sm"
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Company</label>
                <input
                  className="bg-white border border-black/10 rounded-lg p-3 text-[#111111] text-sm"
                  value={form.company}
                  onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Description</label>
                <textarea
                  className="bg-white border border-black/10 rounded-lg p-3 text-[#111111] text-sm h-24"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-lg border border-black/15 uppercase text-xs tracking-wider">Cancel</button>
              <button onClick={saveItem} className="px-5 py-2.5 rounded-lg bg-[#FFE600] uppercase text-xs tracking-wider font-semibold hover:bg-yellow-300">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SKILLS SUBCOMPONENT ────────────────────────────────────────────

const Skills: React.FC<{ data: typeof defaultData; save: (s: string, v: any) => void }> = ({ data, save }) => {
  const [items, setItems] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => setItems(data.skills || []), [data.skills]);

  const persist = (updated: string[]) => {
    setItems(updated);
    save('skills', updated);
  };

  const handleAdd = () => {
    if (!newSkill.trim()) return;
    persist([...items, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemove = (idx: number) => {
    const updated = [...items];
    updated.splice(idx, 1);
    persist(updated);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Skills &amp; Expertise</h2>
      <div className="bg-[#F4F4F6] border border-black/10 p-6 rounded-xl mb-6">
        <div className="flex gap-3 mb-6">
          <input
            className="flex-1 bg-white border border-black/10 rounded-lg p-3 text-[#111111] text-sm"
            placeholder="Add a new skill (e.g. Premiere Pro)"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} className="bg-[#FFE600] px-6 py-3 rounded-lg font-semibold uppercase tracking-widest text-xs hover:bg-yellow-300 transition shadow-lg shadow-black/10 whitespace-nowrap">
            + Add
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {items.map((skill, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white border border-black/15 px-3 py-1.5 rounded-full group">
              <span className="text-sm text-[#111111]">{skill}</span>
              <button onClick={() => handleRemove(idx)} className="text-[#111111]/40 hover:text-red-400 transition ml-1">
                ✕
              </button>
            </div>
          ))}
          {items.length === 0 && <span className="text-sm text-[#111111]/30 italic">No skills added yet.</span>}
        </div>
      </div>
    </div>
  );
};

// ─── ABOUT SUBCOMPONENT ─────────────────────────────────────────────

const About: React.FC<{ data: typeof defaultData; save: (s: string, v: any) => void }> = ({ data, save }) => {
  const [form, setForm] = useState({ ...(data.about || {}) });

  useEffect(() => {
    setForm({ ...(data.about || {}) });
  }, [data.about]);

  const setVal = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">About</h2>
      <div className="flex flex-col gap-5 bg-[#F4F4F6] border border-black/10 p-6 rounded-xl mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Bio Description</label>
          <textarea
            className="bg-white border border-black/10 rounded-lg p-3 text-[#111111] text-sm h-28"
            value={form.bio}
            onChange={e => setVal('bio', e.target.value)}
          />
        </div>
        {['email', 'phone', 'instagramUrl', 'linkedinUrl', 'youtubeUrl'].map(key => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">
              {key.replace('Url', '')}
            </label>
            <input
              className="bg-white border border-black/10 rounded-lg p-3 text-[#111111] text-sm"
              value={(form as any)[key] || ''}
              onChange={e => setVal(key, e.target.value)}
            />
          </div>
        ))}
        <ImageUpload
          value={form.photoUrl || ''}
          onChange={url => setVal('photoUrl', url)}
          folderPath="profile"
          label="📸 Profile Photo"
        />
        <button onClick={() => save('about', form)} className="bg-[#FFE600] px-6 py-3 rounded-lg font-semibold uppercase tracking-widest text-xs hover:bg-yellow-300 transition w-fit mt-2 shadow-lg shadow-black/10">
          Save About Details
        </button>
      </div>
    </div>
  );
};

// ─── SETTINGS SUBCOMPONENT ──────────────────────────────────────────

const Settings: React.FC<{ data: typeof defaultData; save: (s: string, v: any) => void }> = ({ data, save }) => {
  const [form, setForm] = useState({ 
    web3formsAccessKey: (data.settings as any)?.web3formsAccessKey || '',
    footerHeading: (data.settings as any)?.footerHeading || "Let's work together",
    footerBio: (data.settings as any)?.footerBio || "I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions."
  });

  useEffect(() => {
    setForm({ 
      web3formsAccessKey: (data.settings as any)?.web3formsAccessKey || '',
      footerHeading: (data.settings as any)?.footerHeading || "Let's work together",
      footerBio: (data.settings as any)?.footerBio || "I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions."
    });
  }, [data.settings]);

  const setVal = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Global Settings</h2>
      <div className="flex flex-col gap-5 bg-[#F4F4F6] border border-black/10 p-6 rounded-xl mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Footer CTA Heading</label>
          <input
            className="bg-white border border-black/10 rounded-lg p-3 text-[#111111] text-sm"
            value={form.footerHeading}
            onChange={e => setVal('footerHeading', e.target.value)}
            placeholder="e.g. Let's work together"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1">Footer CTA Bio</label>
          <textarea
            className="bg-white border border-black/10 rounded-lg p-3 text-[#111111] text-sm h-24"
            value={form.footerBio}
            onChange={e => setVal('footerBio', e.target.value)}
            placeholder="Short bio/text for the footer"
          />
          <p className="text-[10px] text-[#111111]/40 mt-0.5">This text appears at the very bottom of the website above the email/whatsapp buttons.</p>
        </div>

        <button onClick={() => save('settings', form)} className="bg-[#FFE600] px-6 py-3 rounded-lg font-semibold uppercase tracking-widest text-xs hover:bg-yellow-300 transition w-fit mt-2 shadow-lg shadow-black/10">
          Save Settings
        </button>
      </div>
    </div>
  );
};

// ─── SEED DATA SUBCOMPONENT ─────────────────────────────────────────

const SeedData: React.FC<{
  setData: (d: typeof defaultData) => void;
  flash: (m?: string) => void;
}> = ({ setData, flash }) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleReset = async () => {
    if (!confirmed) { setConfirmed(true); return; }
    const fresh = resetData();
    setData(fresh);
    setConfirmed(false);
    flash('Reset to default data! ✅');
  };


  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Seed Data</h2>
      <div className="bg-[#F4F4F6] border border-red-950 p-6 rounded-xl mb-6 flex flex-col gap-4">
        <h3 className="font-bold text-red-500">Danger Zone: Reset Database</h3>
        <p className="text-sm text-[#111111]/60">This action will completely wipe out your custom Firebase data and restore it to default template presets.</p>
        <button
          onClick={handleReset}
          className={`px-6 py-3 rounded-lg font-semibold uppercase tracking-widest text-xs transition w-fit ${confirmed ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-950/40'}`}
        >
          {confirmed ? '⚠️ Confirm Database Reset' : 'Reset Database to Presets'}
        </button>
      </div>
    </div>
  );
};

// ─── BRAND LOGOS MANAGEMENT SUBCOMPONENT ─────────────────────────────────
const BrandLogosManagement: React.FC<{ data: typeof defaultData; save: (s: string, v: any) => void }> = ({ data, save }) => {
  const [items, setItems] = useState<{ id: string; name: string; logoUrl: string }[]>([]);
  const [modal, setModal] = useState<{ isEdit: boolean; id?: string } | null>(null);
  const [form, setForm] = useState({ name: '', logoUrl: '' });

  useEffect(() => setItems((data as any).brandLogos || []), [(data as any).brandLogos]);

  const persist = (updated: any) => {
    setItems(updated);
    save('brandLogos', updated);
  };

  const openAdd = () => {
    setForm({ name: '', logoUrl: '' });
    setModal({ isEdit: false });
  };

  const openEdit = (item: any) => {
    setForm({ name: item.name, logoUrl: item.logoUrl || '' });
    setModal({ isEdit: true, id: item.id });
  };

  const saveItem = () => {
    if (modal?.isEdit) {
      persist(items.map((i: any) => i.id === modal.id ? { ...i, ...form } : i));
    } else {
      persist([...items, { id: uid(), ...form }]);
    }
    setModal(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Brand Logos</h2>
        <button onClick={openAdd} className="bg-[#FFE600] text-black font-semibold py-2 px-4 rounded-lg uppercase tracking-wider text-xs hover:bg-yellow-300">
          + Add Logo
        </button>
      </div>
      <p className="text-sm text-[#111111]/50 mb-6">Yahan aap un brands ke logos add kar sakte ho jinke saath aapne kaam kiya hai. Ye logos aapki website pe showcase honge.</p>

      {/* Logos Grid Preview */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-[#F4F4F6] border border-black/10 rounded-2xl">
          {items.map((item: any) => (
            <div key={item.id} className="flex flex-col items-center gap-2 group/logo relative">
              <div className="w-20 h-20 bg-white border border-black/15 rounded-xl flex items-center justify-center overflow-hidden p-2">
                {item.logoUrl ? (
                  <img src={item.logoUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-xs text-[#111111]/30 text-center">{item.name}</span>
                )}
              </div>
              <span className="text-[10px] text-[#111111]/50 max-w-[80px] text-center truncate">{item.name}</span>
              <div className="absolute -top-2 -right-2 hidden group-hover/logo:flex gap-1">
                <button onClick={() => openEdit(item)} className="w-6 h-6 bg-[#FFE600] rounded-full text-[9px] text-white flex items-center justify-center">✏️</button>
                <button onClick={() => { if(confirm('Delete?')) persist(items.filter((i:any) => i.id !== item.id)); }} className="w-6 h-6 bg-red-700 rounded-full text-[9px] text-white flex items-center justify-center">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-3">
        {items.map((item: any) => (
          <div key={item.id} className="bg-[#F4F4F6] border border-black/10 p-4 rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden p-1">
                {item.logoUrl ? (
                  <img src={item.logoUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-[10px] text-[#111111]/30">No img</span>
                )}
              </div>
              <span className="font-semibold text-[#111111]">{item.name}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => openEdit(item)} className="text-xs text-[#111111]/50 hover:text-[#111111]">Edit</button>
              <button onClick={() => { if(confirm('Delete?')) persist(items.filter((i:any) => i.id !== item.id)); }} className="text-xs text-red-500 hover:text-red-400">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center text-[#111111]/30 py-12 italic">Abhi koi logo add nahi kiya. Upar "+ Add Logo" click karo.</div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
          <div className="bg-[#F4F4F6] p-6 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{modal.isEdit ? 'Edit Brand Logo' : 'Add Brand Logo'}</h3>
            <div className="flex flex-col gap-4">
              <input
                className="bg-white border border-black/10 rounded p-2 text-sm"
                placeholder="Brand Name (e.g. Flipkart, ICICI Bank)"
                value={form.name}
                onChange={e => setForm(p => ({...p, name: e.target.value}))}
              />
              {/* Logo: URL paste karo ya upload karo - free aspect ratio */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-[#111111]/50 font-semibold">Brand Logo</label>
                <input
                  className="bg-white border border-black/10 rounded p-2 text-sm"
                  placeholder="Logo URL paste karo (e.g. https://...logo.png)"
                  value={form.logoUrl}
                  onChange={e => setForm(p => ({...p, logoUrl: e.target.value}))}
                />
                <p className="text-[10px] text-[#111111]/40 text-center">— ya apne computer se upload karo —</p>
                <ImageUpload
                  value={form.logoUrl}
                  onChange={url => setForm(p => ({...p, logoUrl: url}))}
                  folderPath="brand-logos"
                  label="Upload Brand Logo (PNG/SVG/JPG)"
                />
                {/* Live Preview */}
                {form.logoUrl && (
                  <div className="mt-2 p-4 bg-white border border-black/15 rounded-xl flex items-center justify-center min-h-[80px]">
                    <img
                      src={form.logoUrl}
                      alt="Logo Preview"
                      className="max-h-16 max-w-full object-contain"
                      onError={e => (e.currentTarget.style.display='none')}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-black/15 rounded text-xs">Cancel</button>
              <button onClick={saveItem} className="px-4 py-2 bg-[#FFE600] rounded text-xs font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── WEBSITES MANAGEMENT SUBCOMPONENT ────────────────────────────────
const WebsitesManagement: React.FC<{ data: typeof defaultData; save: (s: string, v: any) => void }> = ({ data, save }) => {
  const [items, setItems] = useState<typeof defaultData.websites>([]);
  const [modal, setModal] = useState<{ isEdit: boolean; id?: string } | null>(null);
  const [form, setForm] = useState({ title: '', description: '', url: '', previewUrl: '', tags: '' });

  useEffect(() => setItems(data.websites || []), [data.websites]);

  const persist = (updated: any) => {
    setItems(updated);
    save('websites', updated);
  };

  const openAdd = () => {
    setForm({ title: '', description: '', url: '', previewUrl: '', tags: '' });
    setModal({ isEdit: false });
  };

  const openEdit = (item: any) => {
    setForm({ ...item, tags: (item.tags || []).join(', ') });
    setModal({ isEdit: true, id: item.id });
  };

  const saveItem = () => {
    const tagsArr = (form.tags || '').split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
    if (modal?.isEdit) {
      persist(items.map((i: any) => i.id === modal.id ? { ...i, ...form, tags: tagsArr } : i));
    } else {
      persist([...items, { id: uid(), ...form, tags: tagsArr }]);
    }
    setModal(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Websites Built</h2>
        <button onClick={openAdd} className="bg-[#FFE600] text-black font-semibold py-2 px-4 rounded-lg uppercase tracking-wider text-xs hover:bg-yellow-300">
          + Add Website
        </button>
      </div>
      <div className="flex flex-col gap-3 mb-8">
        {items.map((item: any) => (
          <div key={item.id} className="bg-[#F4F4F6] border border-black/10 p-4 rounded-xl flex justify-between items-center">
            <div>
              <h3 className="font-bold text-[#111111]">{item.title}</h3>
              <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400">{item.url}</a>
            </div>
            <div className="flex gap-3">
              <button onClick={() => openEdit(item)} className="text-xs text-[#111111]/50 hover:text-[#111111]">Edit</button>
              <button onClick={() => { if(confirm('Delete?')) persist(items.filter((i:any) => i.id !== item.id)); }} className="text-xs text-red-500 hover:text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
          <div className="bg-[#F4F4F6] p-6 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{modal.isEdit ? 'Edit Website' : 'Add Website'}</h3>
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
              <input className="bg-white border border-black/10 rounded p-2 text-sm" placeholder="Title" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} />
              <input className="bg-white border border-black/10 rounded p-2 text-sm" placeholder="Website URL (e.g. https://yoursite.com)" value={form.url} onChange={e => setForm(p => ({...p, url: e.target.value}))} />
              {/* Preview image: paste URL OR upload file */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest text-[#111111]/50 font-semibold">Preview Image</label>
                <input
                  className="bg-white border border-black/10 rounded p-2 text-sm"
                  placeholder="Paste image URL (e.g. https://i.imgur.com/abc.jpg)"
                  value={form.previewUrl}
                  onChange={e => setForm(p => ({...p, previewUrl: e.target.value}))}
                />
                <p className="text-[10px] text-[#111111]/40 px-1">— ya neeche se apne computer se upload karo —</p>
                <ImageUpload
                  value={form.previewUrl}
                  onChange={url => setForm(p => ({...p, previewUrl: url}))}
                  folderPath="websites"
                  label="Upload Website Screenshot / Mockup"
                />
                {form.previewUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-white/10">
                    <img src={form.previewUrl} alt="Preview" className="w-full h-36 object-cover" onError={e => (e.currentTarget.style.display='none')} />
                  </div>
                )}
              </div>
              <textarea className="bg-white border border-black/10 rounded p-2 text-sm h-20" placeholder="Description" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
              <input className="bg-white border border-black/10 rounded p-2 text-sm" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(p => ({...p, tags: e.target.value}))} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-black/15 rounded text-xs">Cancel</button>
              <button onClick={saveItem} className="px-4 py-2 bg-[#FFE600] rounded text-xs font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── ACHIEVEMENTS MANAGEMENT SUBCOMPONENT ────────────────────────────
const AchievementsManagement: React.FC<{ data: typeof defaultData; save: (s: string, v: any) => void }> = ({ data, save }) => {
  const [items, setItems] = useState<any[]>([]);
  const [modal, setModal] = useState<{ isEdit: boolean; id?: string } | null>(null);
  const [form, setForm] = useState({
    title: '',
    badge: '🏆 AWARD WINNER',
    caption: '',
    photoUrl: '',
    photoUrls: [] as string[],
    linkUrl: '',
    dateText: '',
    hashtags: ''
  });

  useEffect(() => setItems((data as any).achievements || []), [(data as any).achievements]);

  const persist = (updated: any) => {
    setItems(updated);
    save('achievements', updated);
  };

  const openAdd = () => {
    setForm({ title: '', badge: '🏆 AWARD WINNER', caption: '', photoUrl: '', photoUrls: [], linkUrl: '', dateText: '', hashtags: '' });
    setModal({ isEdit: false });
  };

  const openEdit = (item: any) => {
    setForm({
      title: item.title || '',
      badge: item.badge || '🏆 AWARD WINNER',
      caption: item.caption || '',
      photoUrl: item.photoUrl || '',
      photoUrls: item.photoUrls || (item.photoUrl ? [item.photoUrl] : []),
      linkUrl: item.linkUrl || '',
      dateText: item.dateText || '',
      hashtags: (item.hashtags || []).join(', ')
    });
    setModal({ isEdit: true, id: item.id });
  };

  const saveItem = () => {
    const tagsArr = (form.hashtags || '').split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
    const firstPhoto = form.photoUrls[0] || form.photoUrl || '';
    const updatedForm = { ...form, photoUrl: firstPhoto };
    if (modal?.isEdit) {
      persist(items.map((i: any) => i.id === modal.id ? { ...i, ...updatedForm, hashtags: tagsArr } : i));
    } else {
      const uid = () => Math.random().toString(36).slice(2, 9);
      persist([...items, { id: uid(), ...updatedForm, hashtags: tagsArr }]);
    }
    setModal(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Achievements & Awards</h2>
        <button onClick={openAdd} className="bg-[#FFE600] text-black font-semibold py-2 px-4 rounded-lg uppercase tracking-wider text-xs hover:bg-yellow-300">
          + Add Achievement / Award
        </button>
      </div>
      <div className="flex flex-col gap-3 mb-8">
        {items.map((item: any) => (
          <div key={item.id} className="bg-[#F4F4F6] border border-black/10 p-4 rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              {item.photoUrl ? (
                <img src={item.photoUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[#222] flex items-center justify-center font-bold text-xs">🏆</div>
              )}
              <div>
                <h3 className="font-bold text-[#111111]">{item.title}</h3>
                <span className="text-xs text-amber-400 font-mono">{item.badge}</span>
                {item.linkUrl && (
                  <a href={item.linkUrl} target="_blank" rel="noreferrer" className="block text-[10px] text-blue-400 truncate max-w-xs">{item.linkUrl}</a>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => openEdit(item)} className="text-xs text-[#111111]/50 hover:text-[#111111]">Edit</button>
              <button onClick={() => { if(confirm('Delete?')) persist(items.filter((i:any) => i.id !== item.id)); }} className="text-xs text-red-500 hover:text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#F4F4F6] p-6 rounded-2xl w-full max-w-lg border border-black/15">
            <h3 className="text-xl font-bold mb-4">{modal.isEdit ? 'Edit Achievement' : 'Add Achievement'}</h3>
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
              <input className="bg-white border border-black/10 rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-[#111111] w-full" placeholder="Achievement Title" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} />
              <input className="bg-white border border-black/10 rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-[#111111] w-full" placeholder="Badge (e.g. 🏆 PERFORMANCE MARKETING AWARD)" value={form.badge} onChange={e => setForm(p => ({...p, badge: e.target.value}))} />
              <input className="bg-white border border-black/10 rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-[#111111] w-full" placeholder="Date/Year (e.g. E4M Awards 2026)" value={form.dateText} onChange={e => setForm(p => ({...p, dateText: e.target.value}))} />
              
              {/* Carousel multi-photo uploader UI */}
              <div className="flex flex-col gap-2 border border-black/10 rounded-xl p-3 bg-white/50">
                <label className="text-xs uppercase tracking-widest text-[#111111]/60 font-medium">Achievement Photos (Carousel)</label>
                
                {form.photoUrls && form.photoUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {form.photoUrls.map((url, index) => (
                      <div key={index} className="relative bg-[#0C0C0C] border border-[#222] rounded-lg overflow-hidden aspect-[4/3]">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setForm(p => ({
                              ...p,
                              photoUrls: p.photoUrls.filter((_, idx) => idx !== index)
                            }));
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 transition text-[10px] font-bold"
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <ImageUpload
                  value=""
                  onChange={url => {
                    if (url) {
                      setForm(p => ({
                        ...p,
                        photoUrls: [...(p.photoUrls || []), url]
                      }));
                    }
                  }}
                  folderPath="achievements"
                  label="+ Add Photo to Carousel"
                />
              </div>

              <textarea className="bg-white border border-black/10 rounded-lg px-3 py-2.5 min-h-[80px] text-sm text-[#111111] w-full" placeholder="Caption / Description" value={form.caption} onChange={e => setForm(p => ({...p, caption: e.target.value}))} />
              <input className="bg-white border border-black/10 rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-[#111111] w-full" placeholder="LinkedIn or Verification Link URL" value={form.linkUrl} onChange={e => setForm(p => ({...p, linkUrl: e.target.value}))} />
              <input className="bg-white border border-black/10 rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-[#111111] w-full" placeholder="Hashtags (comma separated)" value={form.hashtags} onChange={e => setForm(p => ({...p, hashtags: e.target.value}))} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-black/15 rounded text-xs">Cancel</button>
              <button onClick={saveItem} className="px-4 py-2 bg-[#FFE600] rounded text-xs font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── REVIEWS MANAGEMENT SUBCOMPONENT ─────────────────────────────────
export const ReviewsManagement: React.FC<{ data: typeof defaultData; save: (s: string, v: any) => void }> = ({ data, save }) => {
  const [items, setItems] = useState<typeof defaultData.reviews>([]);
  const [modal, setModal] = useState<{ id?: string; isEdit?: boolean } | null>(null);
  const [form, setForm] = useState({ clientName: '', comment: '', rating: 5, logoUrl: '' });

  useEffect(() => setItems(data.reviews || []), [data.reviews]);

  const persist = (updated: any) => {
    setItems(updated);
    save('reviews', updated);
  };

  const toggleStatus = (id: string, status: string) => {
    persist(items.map((i: any) => i.id === id ? { ...i, status } : i));
  };

  const openAdd = () => {
    setForm({ clientName: '', comment: '', rating: 5, logoUrl: '' });
    setModal({ isEdit: false });
  };

  const openEdit = (item: any) => {
    setForm({ clientName: item.clientName, comment: item.comment, rating: item.rating, logoUrl: item.logoUrl || '' });
    setModal({ id: item.id, isEdit: true });
  };

  const saveEdit = () => {
    if (modal?.isEdit) {
      persist(items.map((i: any) => i.id === modal.id ? { ...i, ...form } : i));
    } else {
      const uid = () => Math.random().toString(36).slice(2, 9);
      persist([...items, { id: uid(), ...form, status: 'approved', date: new Date().toISOString() }]);
    }
    setModal(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Client Reviews</h2>
        <button onClick={openAdd} className="bg-[#FFE600] text-black font-semibold py-2 px-4 rounded-lg uppercase tracking-wider text-xs hover:bg-yellow-300">
          + Add Review
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {items.map((item: any) => (
          <div key={item.id} className="bg-[#F4F4F6] border border-black/10 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-[#111111]">{item.clientName}</span>
                <span className="text-amber-400 text-xs">★ {item.rating}/5</span>
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${item.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-[#111111]/60 italic">"{item.comment}"</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleStatus(item.id, item.status === 'approved' ? 'pending' : 'approved')} className="text-xs px-3 py-1.5 bg-[#F0F0F2] border border-black/15 rounded hover:bg-black/10">
                {item.status === 'approved' ? 'Unapprove' : 'Approve'}
              </button>
              <button onClick={() => openEdit(item)} className="text-xs px-3 py-1.5 bg-[#F0F0F2] border border-black/15 rounded hover:bg-black/10">Edit</button>
              <button onClick={() => { if(confirm('Delete?')) persist(items.filter((i:any) => i.id !== item.id)); }} className="text-xs px-3 py-1.5 bg-red-950/20 text-red-400 rounded hover:bg-red-950/40">Delete</button>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
          <div className="bg-[#F4F4F6] p-6 rounded-2xl w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">{modal.isEdit ? 'Edit Review' : 'Add Review'}</h3>
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
              <input className="bg-white border border-black/10 rounded p-2 text-sm" placeholder="Client Name" value={form.clientName} onChange={e => setForm(p => ({...p, clientName: e.target.value}))} />
              <input type="number" min="1" max="5" className="bg-white border border-black/10 rounded p-2 text-sm" placeholder="Rating" value={form.rating} onChange={e => setForm(p => ({...p, rating: parseInt(e.target.value)}))} />
              <ImageUpload
                value={form.logoUrl}
                onChange={url => setForm(p => ({...p, logoUrl: url}))}
                folderPath="logos"
                label="Client Brand Logo"
              />
              <textarea className="bg-white border border-black/10 rounded p-2 text-sm h-24" placeholder="Comment" value={form.comment} onChange={e => setForm(p => ({...p, comment: e.target.value}))} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-black/15 rounded text-xs">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 bg-[#FFE600] rounded text-xs font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SERVICES MANAGEMENT SUBCOMPONENT ────────────────────────────────
export const ServicesManagement: React.FC<{ data: typeof defaultData; save: (s: string, v: any) => void }> = ({ data, save }) => {
  const [items, setItems] = useState<any[]>([]);
  const [modal, setModal] = useState<{ isEdit: boolean; id?: string } | null>(null);
  const [form, setForm] = useState({ name: '', icon: 'sparkles', description: '', details: '' });

  useEffect(() => setItems((data as any).services || defaultData.services), [(data as any).services]);

  const persist = (updated: any) => {
    setItems(updated);
    save('services', updated);
  };

  const openAdd = () => {
    setForm({ name: '', icon: 'sparkles', description: '', details: '' });
    setModal({ isEdit: false });
  };

  const openEdit = (item: any) => {
    setForm({ name: item.name, icon: item.icon || 'sparkles', description: item.description || '', details: item.details || '' });
    setModal({ isEdit: true, id: item.id });
  };

  const saveItem = () => {
    if (modal?.isEdit) {
      persist(items.map((i: any) => i.id === modal.id ? { ...i, ...form } : i));
    } else {
      persist([...items, { id: uid(), ...form }]);
    }
    setModal(null);
  };

  const deleteItem = (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    persist(items.filter((i: any) => i.id !== id));
  };

  const getIconLabel = (ic: string) => {
    switch(ic) {
      case 'sparkles': return '✨ Sparkles';
      case 'video': return '🎬 Video';
      case 'user': return '👤 User';
      case 'film': return '🎞️ Film';
      case 'briefcase': return '💼 Briefcase';
      case 'globe': return '🌐 Globe';
      default: return '✨ Sparkles';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Services</h2>
        <button onClick={openAdd} className="bg-[#FFE600] text-black font-semibold py-2 px-4 rounded-lg uppercase tracking-wider text-xs hover:bg-yellow-300">
          + Add Service
        </button>
      </div>
      <p className="text-sm text-[#111111]/50 mb-6 font-sans">Apne brands and clients ke liye custom services define karein. Ye dynamic list homepage services grid pe render hogi.</p>

      <div className="flex flex-col gap-3">
        {items.map((item: any, idx: number) => (
          <div key={item.id} className="bg-[#F4F4F6] border border-black/10 p-4 rounded-xl flex justify-between items-center gap-4">
            <div className="flex items-center gap-3 truncate">
              <span className="font-mono text-xs text-[#111111]/35 shrink-0">{String(idx + 1).padStart(2, '0')}</span>
              <span className="text-base shrink-0">{getIconLabel(item.icon)}</span>
              <div className="truncate">
                <span className="font-semibold text-[#111111] block truncate">{item.name}</span>
                <span className="text-xs text-[#111111]/50 truncate block">{item.description}</span>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={() => openEdit(item)} className="text-xs text-[#111111]/50 hover:text-[#111111]">Edit</button>
              <button onClick={() => deleteItem(item.id)} className="text-xs text-red-500 hover:text-red-400">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center text-[#111111]/30 py-12 italic">Koi custom service add nahi ki. Upar "+ Add Service" click karein.</div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
          <div className="bg-[#F4F4F6] p-6 rounded-2xl w-full max-w-lg border border-black/10">
            <h3 className="text-xl font-bold mb-4">{modal.isEdit ? 'Edit Service' : 'Add Service'}</h3>
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1 font-semibold">Service Name</label>
                <input className="bg-white border border-black/10 rounded p-2 text-sm text-[#111111]" placeholder="Service Name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1 font-semibold">Icon Picker</label>
                <select className="bg-white border border-black/10 rounded p-2 text-sm text-[#111111]" value={form.icon} onChange={e => setForm(p => ({...p, icon: e.target.value}))}>
                  <option value="sparkles">✨ Sparkles</option>
                  <option value="video">🎬 Video</option>
                  <option value="user">👤 User</option>
                  <option value="film">🎞️ Film</option>
                  <option value="briefcase">💼 Briefcase</option>
                  <option value="globe">🌐 Globe</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1 font-semibold">Short Description (Grid)</label>
                <textarea className="bg-white border border-black/10 rounded p-2 text-sm h-16 text-[#111111] resize-none" placeholder="Short description shown on grid cards..." value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-widest text-black/70 mb-1 font-semibold">Detailed Description (Popup Modal)</label>
                <textarea className="bg-white border border-black/10 rounded p-2 text-sm h-28 text-[#111111] resize-none font-sans leading-relaxed" placeholder="Detailed description shown inside popup modal details..." value={form.details} onChange={e => setForm(p => ({...p, details: e.target.value}))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-black/15 rounded text-xs">Cancel</button>
              <button onClick={saveItem} className="px-4 py-2 bg-[#FFE600] rounded text-xs font-bold hover:bg-yellow-300 transition">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

