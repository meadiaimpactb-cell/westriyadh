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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <SectionHead eyebrow="HOW" title={t.how.title} sub={t.how.sub} />
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: MapPin, tt: t.how.s1t, d: t.how.s1d, n: '01', c: '#2BB3A3' },
            { icon: Search, tt: t.how.s2t, d: t.how.s2d, n: '02', c: '#F5A623' },
            { icon: BellRing, tt: t.how.s3t, d: t.how.s3d, n: '03', c: '#8B5CF6' },
          ].map((s, i) => (
            <div key={i} className="surface-card p-7 relative overflow-hidden group hover:border-[hsl(var(--teal-500))] transition-colors">
              <span className="absolute top-4 end-5 font-black text-4xl text-[hsl(var(--teal-50))] font-mono-num">{s.n}</span>
              <span className="w-11 h-11 rounded-xl text-white flex items-center justify-center mb-5" style={{ background: s.c }}><s.icon size={20} /></span>
              <h3 className="font-extrabold text-lg text-[#1B2A33]">{s.tt}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mt-2">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="brand-panel py-16 lg:py-20 relative overflow-hidden">
        <div className="grid-texture absolute inset-0 opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2"><BrainCircuit className="text-[#7CE3C4]" size={26} /><span className="eyebrow !text-[#7CE3C4]">AI LAYER</span></div>
          <SectionHead title={t.ai.title} sub={t.ai.sub} light />
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: UserRound, title: t.ai.seekerTitle, items: [t.ai.f1, t.ai.f2, t.ai.f3, t.ai.f4, t.ai.f5], action: () => nav({ name: 'cv' }), cta: t.nav.cv },
              { icon: Building2, title: t.ai.empTitle, items: [t.ai.g1, t.ai.g2, t.ai.g3, t.ai.g4, t.ai.g5], action: () => nav({ name: 'employer' }), cta: t.employersCta.cta },
            ].map((col, i) => (
              <div key={i} className="rounded-3xl border border-white/12 bg-white/[0.05] p-7">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-10 h-10 rounded-xl grad-bar text-white flex items-center justify-center"><col.icon size={19} /></span>
                  <h3 className="text-white font-extrabold text-lg">{col.title}</h3>
                </div>
                <ul className="space-y-3">
                  {col.items.map((f, j) => (
                    <li key={j} className="flex gap-2.5 text-sm text-white/70 leading-relaxed">
                      <Sparkles size={14} className="text-[#F5A623] shrink-0 mt-1" /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={col.action} className="btn btn-ghost-light btn-sm mt-6">{col.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <SectionHead eyebrow="JOBS" title={t.jobs.title} sub={t.jobs.sub} />
          <button onClick={() => nav({ name: 'jobs' })} className="btn btn-outline btn-md shrink-0 hidden sm:inline-flex mb-10">{t.jobs.details} ←</button>
        </div>
        <div className="grid gap-4">
          {featured.length === 0 && <div className="surface-card p-8 text-center text-[hsl(var(--muted-foreground))]"><Loader2 className="animate-spin mx-auto" /></div>}
          {featured.map(j => <JobCard key={j.id} job={j} hoods={hoods} myHoodId={myHoodId} speed={speed} applied={myApps.some(a => a.jobId === j.id)} onOpen={() => nav({ name: 'job', id: j.id })} />)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="brand-panel rounded-3xl p-8 lg:p-12 relative overflow-hidden">
          <div className="grid-texture absolute inset-0 opacity-50" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="display-3 text-white">{t.employersCta.title}</h2>
              <p className="text-white/60 mt-4 leading-relaxed">{t.employersCta.sub}</p>
              <button onClick={() => nav({ name: user ? 'employer' : 'auth' })} className="btn btn-gold btn-lg mt-7">{t.employersCta.cta}</button>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {[t.employersCta.b1, t.employersCta.b2, t.employersCta.b3, t.employersCta.b4].map((b, i) => (
                <li key={i} className="rounded-2xl border border-white/12 bg-white/[0.05] p-4 text-sm text-white/75 leading-relaxed flex gap-2">
                  <span className="text-[#7CE3C4] font-black font-mono-num">0{i + 1}</span> {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="eyebrow">FLUTTER APP</span>
            <h2 className="display-3 text-[#1B2A33] mt-3">{t.app.title}</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-4 leading-relaxed">{t.app.sub}</p>
            <ul className="mt-6 space-y-3">
              {[t.app.f1, t.app.f2, t.app.f3].map((f, i) => (
                <li key={i} className="flex gap-2.5 text-sm font-semibold text-[#1B2A33]"><Smartphone size={16} className="text-[hsl(var(--teal-600))] shrink-0 mt-0.5" />{f}</li>
              ))}
            </ul>
            <div className="flex gap-3 mt-7">
              {['App Store', 'Google Play'].map(s => (
                <span key={s} className="btn btn-navy btn-md font-latin">{t.app.soon} {s}</span>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="floaty w-[270px] rounded-[2.6rem] border-[10px] border-[#12232b] bg-white shadow-2xl overflow-hidden">
              <div className="brand-panel px-5 pt-8 pb-5">
                <p className="text-[#7CE3C4] text-[0.6rem] font-bold tracking-widest font-mono-num">WESTRIYADH.NET</p>
                <p className="text-white font-extrabold mt-1 text-sm">{t.tagline}</p>
                <div className="mt-3 bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2 text-white/50 text-[0.68rem]"><Search size={11} /> {t.hero.searchJob}</div>
              </div>
              <div className="p-4 space-y-3">
                {jobs.slice(0, 3).map(j => {
                  const jh = hoods.find(h => h.id === j.hoodId);
                  const mh = hoods.find(h => h.id === myHoodId);
                  const km = jh && mh ? haversineKm(mh, jh) : null;
                  return (
                    <div key={j.id} className="border border-[hsl(var(--border))] rounded-xl p-3">
                      <p className="font-bold text-[0.72rem] text-[#1B2A33]">{lang === 'ar' ? j.titleAr : j.titleEn}</p>
                      <div className="flex gap-1.5 mt-1.5">
                        {km !== null && <span className="chip !text-[0.58rem] !py-0.5"><MapPin size={9} /> {km.toFixed(1)} {t.hero.km}</span>}
                        {km !== null && <span className="chip chip-gold !text-[0.58rem] !py-0.5"><Clock3 size={9} /> ~{commuteMinutes(km, speed)} {t.hero.min}</span>}
                      </div>
                    </div>
                  );
                })}
                <div className="rounded-xl bg-[#F5A623]/10 border border-[#F5A623]/40 p-2.5 flex items-center gap-2">
                  <BellRing size={13} className="text-[#F5A623]" />
                  <p className="text-[0.62rem] font-bold text-[#96700a]">{t.dash.stShort}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {news.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <div className="surface-card p-5 flex flex-wrap items-center gap-x-8 gap-y-2">
            <span className="chip chip-teal"><FileText size={12} /> {t.admin.news}</span>
            {news.map(n => <span key={n.id} className="text-sm text-[hsl(var(--muted-foreground))]">{lang === 'ar' ? n.textAr : n.textEn}</span>)}
          </div>
        </section>
      )}
    </div>
  );
}
