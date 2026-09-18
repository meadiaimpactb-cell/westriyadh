import { useState } from 'react';
import { useStore, haversineKm, commuteMinutes } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Clock3, TrendingUp, BadgeCheck, Sparkles, Languages, LayoutDashboard, Wallet, Menu, X, LogOut } from 'lucide-react';

// ── شعار الملتقى — إعادة رسم SVG لعلامة «الأشخاص الخمسة / النجمة» ──────────
export function LogoMark({ size = 42 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="ملتقى توظيف غرب الرياض">
      {/* الأقواس الخمسة المكوّنة للنجمة */}
      <path d="M24 6.5c4.4 2.2 7.5 6 8.6 11" stroke="#2BB3A3" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M36.8 15.5c2.6 4.1 3.2 8.9 1.3 13.7" stroke="#F5A623" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M39 33.5c-2 4.5-5.8 7.7-10.8 8.6" stroke="#8B5CF6" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M24 42.5c-4.9-.6-9-3.4-11.2-7.9" stroke="#6366F1" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M11.5 30.5c-2.3-4.5-2.2-9.7.4-14.2" stroke="#34C38F" strokeWidth="3.4" strokeLinecap="round" />
      {/* الرؤوس */}
      <circle cx="24" cy="6.8" r="4.2" fill="#2BB3A3" />
      <circle cx="39.5" cy="15" r="4.2" fill="#F5A623" />
      <circle cx="37.5" cy="36.5" r="4.2" fill="#8B5CF6" />
      <circle cx="10.5" cy="36.5" r="4.2" fill="#6366F1" />
      <circle cx="8.5" cy="15" r="4.2" fill="#34C38F" />
      {/* مركز النجمة */}
      <path d="M24 19l2.1 4.6 5 .5-3.8 3.3 1.1 4.9-4.4-2.6-4.4 2.6 1.1-4.9-3.8-3.3 5-.5L24 19z" fill="#1B2A33" opacity=".9" />
    </svg>
  );
}

export function Logo({ light = false, size = 42 }: { light?: boolean; size?: number }) {
  const { lang } = useStore();
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <LogoMark size={size} />
      <span className="leading-none">
        <span className="flex items-baseline gap-1.5">
          <span className="text-[0.62rem] font-bold text-[#2BB3A3]">{lang === 'ar' ? 'ملتقى' : 'Forum'}</span>
          <span className={`font-black text-[1.1rem] ${light ? 'text-white' : 'text-[#1B2A33]'}`}>{lang === 'ar' ? 'توظيف' : 'Careers'}</span>
        </span>
        <span className="block text-[0.68rem] font-bold text-[#8B5CF6] mt-1">{lang === 'ar' ? 'غرب الرياض' : 'West Riyadh'}</span>
      </span>
    </span>
  );
}

// ── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const { t, lang, setLang, nav, route } = useStore();
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const link = (name: typeof route.name, label: string) => (
    <button key={name} onClick={() => { nav({ name } as any); setOpen(false); }}
      className={`text-sm font-semibold transition-colors px-1 py-1 ${route.name === name ? 'text-[hsl(var(--teal-600))]' : 'text-[#1B2A33]/80 hover:text-[hsl(var(--teal-600))]'}`}>
      {label}
    </button>
  );
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-lg border-b border-[hsl(var(--border))]">
      <div className="grad-bar h-1" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-4">
        <button onClick={() => nav({ name: 'home' })}><Logo /></button>
        <nav className="hidden lg:flex items-center gap-6">
          {link('home', t.nav.home)}{link('jobs', t.nav.jobs)}{link('cv', t.nav.cv)}{link('employer', t.nav.employers)}{link('guide', t.nav.guide)}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="btn btn-outline btn-sm font-mono-num">
            <Languages size={15} /> {lang === 'ar' ? 'EN' : 'ع'}
          </button>
          {user?.role === 'admin' && (
            <button onClick={() => nav({ name: 'admin' })} className="btn btn-outline btn-sm hidden md:inline-flex">
              <LayoutDashboard size={15} /> {t.nav.admin}
            </button>
          )}
          {isAuthenticated ? (
            <>
              <button onClick={() => nav({ name: user?.accountType === 'employer' ? 'employer' : 'dashboard' })} className="btn btn-navy btn-sm hidden sm:inline-flex">{t.nav.dashboard}</button>
              <button onClick={() => nav({ name: 'wallet' })} className="btn btn-gold btn-sm hidden sm:inline-flex"><Wallet size={14} /> <span className="tnum">{user?.points ?? 0}</span></button>
              <button onClick={logout} className="btn btn-outline btn-sm" title={t.nav.logout}><LogOut size={14} /></button>
            </>
          ) : (
            <button onClick={() => nav({ name: 'auth' })} className="btn btn-navy btn-sm">{t.nav.login}</button>
          )}
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t bg-white px-6 py-4 flex flex-col gap-3">
          {link('home', t.nav.home)}{link('jobs', t.nav.jobs)}{link('cv', t.nav.cv)}{link('employer', t.nav.employers)}{link('guide', t.nav.guide)}
          {user?.role === 'admin' && link('admin', t.nav.admin)}
        </div>
      )}
    </header>
  );
}
