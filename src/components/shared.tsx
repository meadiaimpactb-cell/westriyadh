import { useState } from 'react';
import { useStore, haversineKm, commuteMinutes } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Clock3, TrendingUp, BadgeCheck, Sparkles, Languages, LayoutDashboard, Wallet, Menu, X, LogOut } from 'lucide-react';

// ── شعار الملتقى — إعادة رسم SVG لعلامة «الأشخاص الخمسة / النجمة» ──────────
export function LogoMark({ size = 42 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="ملتقى توظيف غرب الرياض">
      <path d="M24 6.5c4.4 2.2 7.5 6 8.6 11" stroke="#2BB3A3" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M36.8 15.5c2.6 4.1 3.2 8.9 1.3 13.7" stroke="#F5A623" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M39 33.5c-2 4.5-5.8 7.7-10.8 8.6" stroke="#8B5CF6" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M24 42.5c-4.9-.6-9-3.4-11.2-7.9" stroke="#6366F1" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M11.5 30.5c-2.3-4.5-2.2-9.7.4-14.2" stroke="#34C38F" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="24" cy="6.8" r="4.2" fill="#2BB3A3" />
      <circle cx="39.5" cy="15" r="4.2" fill="#F5A623" />
      <circle cx="37.5" cy="36.5" r="4.2" fill="#8B5CF6" />
      <circle cx="10.5" cy="36.5" r="4.2" fill="#6366F1" />
      <circle cx="8.5" cy="15" r="4.2" fill="#34C38F" />
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

// ── شارات المسافة والزمن ─────────────────────────────────────────────────────
export function CommuteBadges({ jobHood, myHood, speed }: { jobHood: any; myHood?: any; speed?: number }) {
  const { t, lang } = useStore();
  if (!jobHood) return null;
  const name = lang === 'ar' ? jobHood.nameAr : jobHood.nameEn;
  if (!myHood) return <span className="chip"><MapPin size={12} /> {name}</span>;
  const km = haversineKm(myHood, jobHood);
  const mins = commuteMinutes(km, speed);
  const near = mins <= 20;
  return (
    <>
      <span className={`chip ${near ? 'chip-gold' : ''}`}><MapPin size={12} /> {name} · <span className="tnum">{km.toFixed(1)}</span> {t.hero.km}</span>
      <span className={`chip ${near ? 'chip-gold' : ''}`}><Clock3 size={12} /> <span className="tnum">~{mins}</span> {t.hero.min}</span>
    </>
  );
}

// ── مؤشر الملاءمة ────────────────────────────────────────────────────────────
export function MatchRing({ value, size = 54 }: { value: number; size?: number }) {
  const { t } = useStore();
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  const color = value >= 85 ? '#146c43' : value >= 70 ? '#F5A623' : '#96700a';
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="match-ring" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e8eaf0" strokeWidth="5" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="5" fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round" />
      </svg>
      <span className="absolute text-[0.7rem] font-bold tnum" style={{ color }}>{value}%</span>
      <span className="sr-only">{t.jobs.match}</span>
    </span>
  );
}

export function matchFor(jobId: number, seekerId?: number) {
  let h = 0;
  const seed = `${jobId * 7919}-${seekerId ?? 0}`;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return 62 + (h % 36);
}

// ── بطاقة الوظيفة ────────────────────────────────────────────────────────────
export function JobCard({ job, onOpen, hoods, myHoodId, speed, applied }: {
  job: any; onOpen: () => void; hoods: any[]; myHoodId?: number | null; speed?: number; applied?: boolean;
}) {
  const { t, lang } = useStore();
  const c = job.company;
  const jh = hoods.find(h => h.id === job.hoodId);
  const myHood = hoods.find(h => h.id === myHoodId);
  return (
    <article onClick={onOpen} className="job-card surface-card p-5 cursor-pointer">
      <div className="flex items-start gap-4">
        <span className="relative shrink-0 w-[58px] h-[58px]">
          <span className="logo-glow rounded-2xl" style={{ background: c?.color ?? '#0F766E' }} />
          <span className="relative w-full h-full rounded-2xl flex items-center justify-center text-white font-black text-lg" style={{ background: c?.color ?? '#0F766E' }}>
            {c?.initials ?? '—'}
          </span>
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-[1.05rem] text-[#1B2A33]">{lang === 'ar' ? job.titleAr : job.titleEn}</h3>
            {job.promoted && <span className="chip chip-gold text-[0.68rem]"><Sparkles size={11} /> {t.jobs.promoted}</span>}
            {applied && <span className="chip !bg-[#e8f7ef] !text-[#146c43] text-[0.68rem]">{t.jobs.applied}</span>}
            {c?.verified && <BadgeCheck size={15} className="text-[hsl(var(--teal-600))]" />}
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            {lang === 'ar' ? c?.nameAr : c?.nameEn}{c?.sectorAr ? ` · ${lang === 'ar' ? c.sectorAr : c.sectorEn}` : ''}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <CommuteBadges jobHood={jh} myHood={myHood} speed={speed} />
            <span className="chip"><TrendingUp size={12} /> <span className="tnum">{job.salaryMin?.toLocaleString()}–{job.salaryMax?.toLocaleString()}</span> {t.jobs.sar}</span>
            <span className="chip">{t.jobs[job.type as 'full']}</span>
          </div>
        </div>
        <span className="job-arrow shrink-0 w-9 h-9 rounded-full bg-[hsl(var(--teal-600))] text-white flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rtl:-scale-x-100" /></svg>
        </span>
      </div>
    </article>
  );
}

// ── عنوان قسم ────────────────────────────────────────────────────────────────
export function SectionHead({ eyebrow, title, sub, light = false }: { eyebrow?: string; title: string; sub?: string; light?: boolean }) {
  return (
    <div className="max-w-2xl mb-10">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className={`display-3 mt-3 ${light ? 'text-white' : 'text-[#1B2A33]'}`}>{title}</h2>
      {sub && <p className={`mt-3 leading-relaxed ${light ? 'text-white/65' : 'text-[hsl(var(--muted-foreground))]'}`}>{sub}</p>}
    </div>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
export function Footer({ settings }: { settings?: any }) {
  const { t, nav } = useStore();
  const pol = (slug: string, label: string) => (
    <button key={slug} onClick={() => nav({ name: 'policies', slug })} className="block text-sm text-white/60 hover:text-[#34C38F] transition-colors text-start">{label}</button>
  );
  const ads = settings?.ads;
  return (
    <footer className="brand-panel mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Logo light />
          <p className="text-white/60 text-sm leading-relaxed mt-4 max-w-md">{t.footer.about}</p>
          <p className="text-[#34C38F] text-xs font-semibold mt-4 tracking-wide">{t.footer.coverage}</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">{t.footer.platform}</h4>
          <div className="space-y-2.5">
            <button onClick={() => nav({ name: 'jobs' })} className="block text-sm text-white/60 hover:text-[#34C38F]">{t.nav.jobs}</button>
            <button onClick={() => nav({ name: 'cv' })} className="block text-sm text-white/60 hover:text-[#34C38F]">{t.nav.cv}</button>
            <button onClick={() => nav({ name: 'employer' })} className="block text-sm text-white/60 hover:text-[#34C38F]">{t.nav.employers}</button>
            <button onClick={() => nav({ name: 'guide' })} className="block text-sm text-white/60 hover:text-[#34C38F]">{t.nav.guide}</button>
          </div>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">{t.footer.legal}</h4>
          <div className="space-y-2.5">
            {pol('terms', t.footer.terms)}{pol('privacy', t.footer.privacy)}{pol('payment', t.footer.payment)}{pol('points', t.footer.points)}{pol('ai', t.footer.ai)}
          </div>
        </div>
      </div>
      {ads?.bottomEnabled && (
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-3 text-center text-xs text-white/40">
            {t.adsBar} — <span className="tnum">{ads.bottomPrice}</span> {t.wallet.sar}
          </div>
        </div>
      )}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/45">
          <span>© 2026 {t.brand} — {t.footer.rights}</span>
          <span className="font-mono-num tracking-widest">WESTRIYADH.NET</span>
        </div>
      </div>
    </footer>
  );
}
