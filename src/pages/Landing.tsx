import { useMemo, useState } from 'react';
import { useStore, haversineKm, commuteMinutes } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';
import { SectionHead, JobCard } from '@/components/shared';
import { Search, MapPin, Clock3, Sparkles, BrainCircuit, Building2, UserRound, Smartphone, BellRing, FileText, Route, Megaphone, Loader2 } from 'lucide-react';

export default function Landing() {
  const { t, lang, nav } = useStore();
  const { user } = useAuth();
  const { data: hoods = [] } = trpc.platform.neighborhoods.useQuery();
  const { data: jobs = [] } = trpc.platform.jobs.useQuery();
  const { data: settings } = trpc.platform.settings.useQuery();
  const { data: news = [] } = trpc.platform.news.useQuery();
  const { data: myApps = [] } = trpc.platform.myApplications.useQuery(undefined, { enabled: !!user });

  const [q, setQ] = useState('');
  const [from, setFrom] = useState<number>(0);
  const [to, setTo] = useState<number>(0);
  const [calc, setCalc] = useState<{ km: number; min: number } | null>(null);

  const speed = settings?.geo?.avgSpeed ?? 35.7;
  const kpi = settings?.kpi ?? { jobs: jobs.length, seekers: 0, hires: 0, saved: 0 };
  const myHoodId = user?.hoodId ?? null;
  const featured = useMemo(() => jobs.filter(j => j.promoted).slice(0, 3), [jobs]);

  const doCalc = () => {
    const a = hoods.find(h => h.id === from), b = hoods.find(h => h.id === to);
    if (!a || !b) return;
    const km = haversineKm(a, b);
    setCalc({ km: +km.toFixed(1), min: commuteMinutes(km, speed) });
  };

  const zoneLabel = (z: string) => z === 'west' ? t.onboard.zoneWest : t.onboard.zoneSouth;
  const westHoods = hoods.filter(h => h.zone === 'west');
  const southHoods = hoods.filter(h => h.zone === 'south');

  const HoodSelect = ({ value, onChange, dark = false }: { value: number; onChange: (v: number) => void; dark?: boolean }) => (
    <select value={value} onChange={e => onChange(Number(e.target.value))}
      className={dark ? 'field !bg-white/10 !border-white/15 !text-white text-sm [&>option]:text-black' : 'w-full outline-none text-sm bg-transparent text-[#1B2A33] font-bold'}>
      <option value={0}>—</option>
      <optgroup label={t.onboard.zoneWest}>{westHoods.map(n => <option key={n.id} value={n.id}>{lang === 'ar' ? n.nameAr : n.nameEn}</option>)}</optgroup>
      <optgroup label={t.onboard.zoneSouth}>{southHoods.map(n => <option key={n.id} value={n.id}>{lang === 'ar' ? n.nameAr : n.nameEn}</option>)}</optgroup>
    </select>
  );

  return (
    <div>
      {settings?.ads?.topEnabled && (
        <div className="grad-bar text-white text-center text-[0.8rem] font-bold py-2 px-4">
          <Megaphone size={13} className="inline -mt-0.5 me-1" />
          {lang === 'ar' ? settings.ads.topAr : settings.ads.topEn}
        </div>
      )}

      {/* ── Hero ── */}
      <section className="brand-panel relative overflow-hidden">
        <div className="grid-texture absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <div className="fade-up">
            <span className="inline-flex items-center gap-2 text-[0.72rem] font-bold tracking-[0.14em] uppercase text-[#7CE3C4] border border-white/15 bg-white/5 rounded-full px-3.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C38F] pulse-dot" />
              {t.hero.eyebrow}
            </span>
            <h1 className="display-1 text-white mt-6">
              {settings?.heroTitle || (<>{t.hero.titleA} <span className="grad-text">{t.hero.titleB}</span></>)}
            </h1>
            <p className="text-white/65 text-lg leading-relaxed mt-5 max-w-xl">{settings?.heroSub || t.hero.sub}</p>

            <div className="mt-8 bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl shadow-2xl shadow-black/30">
              <label className="flex items-center gap-2 flex-1 px-3 py-2.5">
                <Search size={17} className="text-[hsl(var(--muted-foreground))] shrink-0" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.hero.searchJob}
                  className="w-full outline-none text-sm text-[#1B2A33] placeholder:text-[hsl(var(--muted-foreground))]" />
              </label>
              <label className="flex items-center gap-2 sm:w-56 px-3 py-2.5 sm:border-s border-t sm:border-t-0 border-[hsl(var(--border))]">
                <MapPin size={17} className="text-[hsl(var(--muted-foreground))] shrink-0" />
                <HoodSelect value={myHoodId ?? 0} onChange={() => nav({ name: user ? 'dashboard' : 'auth' })} />
              </label>
              <button onClick={() => nav({ name: 'jobs' })} className="btn btn-navy btn-md sm:w-auto w-full">{t.hero.searchBtn}</button>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={() => nav({ name: 'jobs' })} className="btn btn-ghost-light btn-md">{t.hero.ctaJobs}</button>
              <button onClick={() => nav({ name: 'cv' })} className="btn btn-ghost-light btn-md"><Sparkles size={15} /> {t.hero.ctaCv}</button>
            </div>
          </div>

          {/* حاسبة التنقل */}
          <div className="fade-up" style={{ animationDelay: '0.15s' }}>
            <div className="rounded-3xl border border-white/12 bg-white/[0.06] backdrop-blur-md p-6 lg:p-7 shadow-2xl shadow-black/40">
              <div className="flex items-center gap-3 mb-1">
                <span className="w-10 h-10 rounded-xl grad-bar flex items-center justify-center text-white"><Route size={19} /></span>
                <h3 className="text-white font-extrabold text-lg">{t.hero.calcTitle}</h3>
              </div>
              <p className="text-white/50 text-xs mb-5">{t.hero.calcSub}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-xs font-bold block mb-1.5">{t.hero.from}</label>
                  <HoodSelect dark value={from} onChange={setFrom} />
                </div>
                <div>
                  <label className="text-white/60 text-xs font-bold block mb-1.5">{t.hero.to}</label>
                  <HoodSelect dark value={to} onChange={setTo} />
                </div>
              </div>
              <button onClick={doCalc} className="btn btn-gold btn-md w-full mt-4">{t.hero.calcBtn}</button>
              {calc && (
                <div className="mt-5 fade-up">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-2xl bg-white/8 border border-white/10 py-4">
                      <div className="text-3xl font-black text-white tnum">{calc.km.toFixed(1)}</div>
                      <div className="text-white/55 text-xs mt-1 flex items-center justify-center gap-1"><MapPin size={12} /> {t.hero.km}</div>
                    </div>
                    <div className="rounded-2xl bg-[#34C38F]/15 border border-[#34C38F]/35 py-4">
                      <div className="text-3xl font-black grad-text tnum">~{calc.min}</div>
                      <div className="text-[#7CE3C4] text-xs mt-1 flex items-center justify-center gap-1"><Clock3 size={12} /> {t.hero.min}</div>
                    </div>
                  </div>
                  <p className="text-white/45 text-[0.72rem] leading-relaxed mt-3">{t.hero.dailySaved}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* شريط الأحياء */}
        <div className="relative border-t border-white/10 py-3.5 overflow-hidden">
          <div className="ticker-track gap-10 px-6">
            {[...hoods, ...hoods].map((n, i) => (
              <span key={i} className="flex items-center gap-2 text-white/45 text-sm whitespace-nowrap">
                <MapPin size={13} className={n.zone === 'west' ? 'text-[#34C38F]' : 'text-[#F5A623]'} />
                {lang === 'ar' ? n.nameAr : n.nameEn}
                <span className="text-[0.6rem] opacity-60">{zoneLabel(n.zone)}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── المؤشرات ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="surface-card p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { v: kpi.jobs ?? jobs.length, l: t.stats.jobs }, { v: kpi.seekers, l: t.stats.seekers },
            { v: kpi.hires, l: t.stats.hires }, { v: kpi.saved, l: t.stats.saved },
          ].map((s, i) => (
            <div key={i} className="text-center lg:border-e last:border-0 border-[hsl(var(--border))]">
              <div className="text-3xl lg:text-4xl font-black text-[#1B2A33] tnum">{Number(s.v).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1 font-semibold">{s.l}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-[0.7rem] text-[hsl(var(--muted-foreground))] mt-3">{t.stats.source} · {t.stats.editable}</p>
      </section>
