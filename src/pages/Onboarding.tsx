import React, { useState } from 'react';
import { useStore, detectLocation } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';
import { INTEREST_FIELDS } from '@/lib/data';
import { CheckCircle2, UserRound, Building2, Crosshair, MapPin, Loader2 } from 'lucide-react';

// ── إكمال الملف + تحديد الموقع التلقائي ─────────────────────────────────────
export function Onboarding() {
  const { t, lang, nav } = useStore();
  const { user, refresh } = useAuth();
  const { data: hoods = [] } = trpc.platform.neighborhoods.useQuery();
  const complete = trpc.platform.completeProfile.useMutation();
  const [role, setRole] = useState<'seeker' | 'employer'>(user?.accountType ?? 'seeker');
  const [hoodId, setHoodId] = useState<number>(user?.hoodId ?? 0);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(user?.lat && user?.lng ? { lat: user.lat, lng: user.lng } : null);
  const [locState, setLocState] = useState<'idle' | 'busy' | 'ok' | 'fail'>(user?.lat ? 'ok' : 'idle');
  const nearest = trpc.platform.nearestHood.useQuery(
    coords ?? { lat: 0, lng: 0 },
    { enabled: !!coords },
  );
  const [interests, setInterests] = useState<string[]>((user?.interests as string[]) ?? []);
  const [currentJob, setCurrentJob] = useState(user?.currentJob ?? '');
  const [expYears, setExpYears] = useState(user?.expYears ?? '1–3');
  const [education, setEducation] = useState(user?.education ?? '');
  const [companyName, setCompanyName] = useState('');
  const [cr, setCr] = useState('');
  const [done, setDone] = useState(false);

  // عند تحديد أقرب حي من GPS — عيّنه تلقائياً
  React.useEffect(() => {
    if (nearest.data && locState === 'busy') {
      setHoodId(nearest.data.id);
      setLocState('ok');
    }
  }, [nearest.data, locState]);

  const detect = () => {
    setLocState('busy');
    detectLocation()
      .then(pos => setCoords({ lat: +pos.coords.latitude.toFixed(5), lng: +pos.coords.longitude.toFixed(5) }))
      .catch(() => setLocState('fail'));
  };

  const toggle = (k: string) => setInterests(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k]);

  const save = async () => {
    await complete.mutateAsync({
      accountType: role, hoodId: hoodId || undefined,
      lat: coords?.lat, lng: coords?.lng,
      currentJob, expYears, education, interests, companyName: role === 'employer' ? companyName : undefined, cr: cr || undefined,
    });
    await refresh();
    setDone(true);
  };

  const westHoods = hoods.filter(h => h.zone === 'west');
  const southHoods = hoods.filter(h => h.zone === 'south');

  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <div className="surface-card p-8">
        {done ? (
          <div className="text-center py-8 fade-up">
            <CheckCircle2 size={54} className="mx-auto text-[#146c43]" />
            <h2 className="display-3 text-[#1B2A33] mt-4">{t.onboard.done}</h2>
            <button onClick={() => nav({ name: 'jobs' })} className="btn btn-gold btn-lg mt-6">{t.hero.ctaJobs}</button>
          </div>
        ) : (
          <>
            <h1 className="display-3 text-[#1B2A33]">{t.onboard.title}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 mb-7">{t.onboard.sub}</p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {(['seeker', 'employer'] as const).map(r => (
                <button key={r} onClick={() => setRole(r)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all ${role === r ? 'border-[hsl(var(--teal-500))] bg-[hsl(var(--teal-50))] text-[hsl(var(--teal-700))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}>
                  {r === 'seeker' ? <UserRound size={16} /> : <Building2 size={16} />} {t.auth[r === 'seeker' ? 'asSeeker' : 'asEmployer']}
                </button>
              ))}
            </div>

            {/* تحديد الموقع — ميزة المنصة الأساسية */}
            <div className="rounded-2xl border-2 border-dashed border-[hsl(var(--teal-500))/50] bg-[hsl(var(--teal-50))] p-5 mb-6">
              <div className="flex items-start gap-3">
                <span className="relative shrink-0 w-11 h-11 rounded-xl bg-[hsl(var(--teal-600))] text-white flex items-center justify-center">
                  <Crosshair size={20} />
                  {locState === 'busy' && <span className="absolute inset-0 rounded-xl bg-[hsl(var(--teal-500))] loc-ping" />}
                </span>
                <div className="flex-1">
                  <p className="font-extrabold text-sm text-[#1B2A33]">{t.onboard.detect}</p>
                  <p className="text-[0.72rem] text-[hsl(var(--muted-foreground))] leading-relaxed mt-1">{t.onboard.locNote}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <button onClick={detect} disabled={locState === 'busy'} className="btn btn-navy btn-sm">
                      {locState === 'busy' ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
                      {locState === 'busy' ? t.onboard.detecting : t.onboard.detect}
                    </button>
                    {locState === 'ok' && hoodId > 0 && (
                      <span className="chip !bg-[#e8f7ef] !text-[#146c43] !border-[#146c43]/25">
                        <MapPin size={12} /> {t.onboard.detected} <b>{lang === 'ar' ? hoods.find(h => h.id === hoodId)?.nameAr : hoods.find(h => h.id === hoodId)?.nameEn}</b>
                        {coords && <span className="tnum text-[0.62rem] opacity-60" dir="ltr">{coords.lat},{coords.lng}</span>}
                      </span>
                    )}
                    {locState === 'fail' && <span className="text-[0.72rem] text-[#b42318] font-bold">{t.onboard.locDenied}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">{t.onboard.hood}</label>
                <select value={hoodId} onChange={e => setHoodId(Number(e.target.value))} className="field">
                  <option value={0}>—</option>
                  <optgroup label={t.onboard.zoneWest}>{westHoods.map(n => <option key={n.id} value={n.id}>{lang === 'ar' ? n.nameAr : n.nameEn}</option>)}</optgroup>
                  <optgroup label={t.onboard.zoneSouth}>{southHoods.map(n => <option key={n.id} value={n.id}>{lang === 'ar' ? n.nameAr : n.nameEn}</option>)}</optgroup>
                </select>
              </div>
              {role === 'seeker' && (
                <>
                  <div><label className="field-label">{t.onboard.currentJob} <span className="font-normal">({t.common.optional})</span></label><input className="field" value={currentJob} onChange={e => setCurrentJob(e.target.value)} /></div>
                  <div><label className="field-label">{t.onboard.exp}</label>
                    <select className="field tnum" value={expYears} onChange={e => setExpYears(e.target.value)}><option>0–1</option><option>1–3</option><option>3–5</option><option>5–10</option><option>+10</option></select>
                  </div>
                  <div><label className="field-label">{t.onboard.edu}</label>
                    <select className="field" value={education} onChange={e => setEducation(e.target.value)}>
                      <option value="">—</option>
                      <option>{lang === 'ar' ? 'ثانوية' : 'High school'}</option><option>{lang === 'ar' ? 'دبلوم' : 'Diploma'}</option>
                      <option>{lang === 'ar' ? 'بكالوريوس' : 'Bachelor'}</option><option>{lang === 'ar' ? 'ماجستير فأعلى' : 'Masters+'}</option>
                    </select>
                  </div>
                </>
              )}
              {role === 'employer' && (
                <>
                  <div><label className="field-label">{t.auth.company}</label><input className="field" value={companyName} onChange={e => setCompanyName(e.target.value)} /></div>
                  <div><label className="field-label">{t.auth.cr}</label><input className="field tnum" dir="ltr" value={cr} onChange={e => setCr(e.target.value)} /></div>
                </>
              )}
            </div>

            {role === 'seeker' && (
              <>
                <label className="field-label mt-5">{t.onboard.interests}</label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_FIELDS.map(f => {
                    const k = f.en, on = interests.includes(k);
                    return <button key={k} onClick={() => toggle(k)} className={`chip cursor-pointer transition-colors ${on ? 'chip-gold' : 'hover:border-[#F5A623]'}`}>{lang === 'ar' ? f.ar : f.en}</button>;
                  })}
                </div>
              </>
            )}

            <div className="flex gap-3 mt-8">
              <button onClick={save} disabled={complete.isPending || hoodId === 0} className="btn btn-navy btn-lg flex-1">
                {complete.isPending && <Loader2 size={16} className="animate-spin" />} {t.onboard.save}
              </button>
              <button onClick={() => nav({ name: 'home' })} className="btn btn-outline btn-lg">{t.onboard.skip}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
