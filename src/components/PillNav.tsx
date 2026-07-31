import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Menu, X } from 'lucide-react';

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export interface PillNavProps {
  logo: React.ReactNode | string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}

export const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  ease = 'power3.out',
  baseColor = '#111111',
  pillColor = '#FFFFFF',
  hoveredPillTextColor = '#111111',
  pillTextColor = '#111111',
  onMobileMenuClick,
  initialLoadAnimation = true
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLDivElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);

  const renderLogo = () => {
    if (typeof logo === 'string') {
      if (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/')) {
        return (
          <img 
            src={logo} 
            alt={logoAlt} 
            className="w-7 h-7 object-contain pointer-events-none rounded-full" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        );
      }
      return (
        <span className="font-extrabold text-sm tracking-tighter text-[#FFE600] flex items-center justify-center">
          {logo}
        </span>
      );
    }
    return (
      <div className="flex items-center justify-center font-extrabold text-xs tracking-widest text-[#FFE600]">
        {logo}
      </div>
    );
  };

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;
        
        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;
        
        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector<HTMLElement>('.pill-label');
        const white = pill.querySelector<HTMLElement>('.pill-label-hover');
        
        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });
        
        tl.to(circle, { 
          scale: 1.2, 
          xPercent: -50, 
          duration: 0.5, 
          ease, 
          overwrite: 'auto' 
        }, 0);
        
        if (label) {
          tl.to(label, { 
            y: -(h + 8), 
            duration: 0.4, 
            ease, 
            overwrite: 'auto' 
          }, 0);
        }
        
        if (white) {
          gsap.set(white, { y: Math.ceil(h + 20), opacity: 0 });
          tl.to(white, { 
            y: 0, 
            opacity: 1, 
            duration: 0.4, 
            ease, 
            overwrite: 'auto' 
          }, 0);
        }
        
        tlRefs.current[index] = tl;
      });
    };

    layout();
    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItems = navItemsRef.current;
      
      if (logoEl) {
        gsap.set(logoEl, { scale: 0.8, opacity: 0 });
        gsap.to(logoEl, {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.7)"
        });
      }
      
      if (navItems) {
        const listItems = navItems.querySelectorAll('li');
        gsap.set(listItems, { opacity: 0, y: -10 });
        gsap.to(listItems, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.1
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.35,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.25,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.7,
      ease: "elastic.out(1, 0.5)",
      overwrite: 'auto',
      onComplete: () => gsap.set(img, { rotate: 0 })
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    
    const menu = mobileMenuRef.current;
    if (menu) {
      if (newState) {
        gsap.set(menu, { display: 'block', opacity: 0, y: -10 });
        gsap.to(menu, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power3.out"
        });
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: -10,
          duration: 0.2,
          ease: "power3.in",
          onComplete: () => {
            gsap.set(menu, { display: 'none' });
          }
        });
      }
    }
    onMobileMenuClick?.();
  };

  return (
    <div className={`relative z-[1000] w-full max-w-4xl mx-auto ${className}`}>
      <nav className="w-full flex items-center justify-between p-2 gap-3" aria-label="Primary">
        {/* Logo Section */}
        <div 
          ref={logoRef}
          onMouseEnter={handleLogoEnter}
          className="flex-shrink-0 cursor-pointer"
        >
          <a
            href={items[0]?.href || '#hero'}
            className="flex items-center justify-center rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-md border border-black/10"
            style={{
              width: '42px',
              height: '42px',
              background: baseColor,
              color: pillColor
            }}
          >
            <div ref={logoImgRef}>
              {renderLogo()}
            </div>
          </a>
        </div>

        {/* Desktop Menu */}
        <div
          ref={navItemsRef}
          className="hidden sm:flex items-center rounded-full px-1.5 shadow-lg border border-black/10"
          style={{
            height: '42px',
            background: baseColor
          }}
        >
          <ul role="menubar" className="list-none flex items-center m-0 p-0 h-full gap-1.5">
            {items.map((item, i) => {
              const isActive = activeHref === item.href;

              return (
                <li key={item.href} role="none" className="flex items-center">
                  <a
                    role="menuitem"
                    href={item.href}
                    className="relative overflow-hidden inline-flex items-center justify-center h-[34px] px-4 rounded-full font-black text-[11px] uppercase tracking-wider cursor-pointer transition-colors duration-200 no-underline"
                    style={{
                      background: isActive ? '#FFE600' : pillColor,
                      color: isActive ? '#111111' : pillTextColor,
                    }}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span
                      className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                      style={{
                        background: '#FFE600',
                        willChange: 'transform'
                      }}
                      aria-hidden="true"
                      ref={el => { circleRefs.current[i] = el; }}
                    />
                    <span className="label-stack relative inline-block leading-none z-[2] overflow-hidden py-1">
                      <span className="pill-label relative z-[2] inline-block font-extrabold" style={{ willChange: 'transform' }}>
                        {item.label}
                      </span>
                      <span
                        className="pill-label-hover absolute left-0 top-1 z-[3] inline-block w-full text-center font-black"
                        style={{ color: hoveredPillTextColor, willChange: 'transform, opacity' }}
                        aria-hidden="true"
                      >
                        {item.label}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="sm:hidden flex items-center justify-center rounded-full transition-transform active:scale-90 shadow-md border border-black/10"
          style={{
            width: '42px',
            height: '42px',
            background: baseColor,
            color: '#FFE600'
          }}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div
        ref={mobileMenuRef}
        className="sm:hidden absolute top-full left-2 right-2 mt-2 rounded-2xl overflow-hidden shadow-2xl z-[999] hidden border border-black/10 p-2"
        style={{ background: baseColor }}
      >
        <ul className="list-none m-0 p-0 flex flex-col gap-1">
          {items.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`block py-3 px-5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                    isActive 
                      ? 'bg-[#FFE600] text-black' 
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
