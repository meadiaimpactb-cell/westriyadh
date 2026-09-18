import { useState } from 'react';
import { Clock3, MapPin, Download, Loader2, BrainCircuit, Sparkles } from 'lucide-react';

// ── مصمم الإعلانات الذكي + تقارير صاحب العمل ────────────────────────────────
export function EmployerAI({ t, lang, points, pricing, hoods, spend, createJob }: any) {
  const [brandColor, setBrandColor] = useState('#0F766E');
  const [adTitle, setAdTitle] = useState('');
  const [adTitleEn, setAdTitleEn] = useState('');
  const [adHood, setAdHood] = useState(0);
  const [adNeed, setAdNeed] = useState('');
  const [adSalaryMin, setAdSalaryMin] = useState(5000);
  const [adSalaryMax, setAdSalaryMax] = useState(8000);
  const [adOut, setAdOut] = useState(false);
  const [msg, setMsg] = useState('');

  const hoodName = (id?: number | null) => { const h = hoods.find((x: any) => x.id === id); return h ? (lang === 'ar' ? h.nameAr : h.nameEn) : '—'; };

  const genAd = async () => {
    if (points < pricing.aiAdCost) { setMsg(t.emp.insufficient); return; }
    await spend.mutateAsync({ amount: pricing.aiAdCost, kind: 'ai_ad' });
    setAdOut(true); setMsg('');
  };
  const publishAd = async () => {
    try {
      await createJob.mutateAsync({
        titleAr: adTitle || 'مسمى وظيفي', titleEn: adTitleEn || adTitle || 'Job Title',
        hoodId: adHood || hoods[0]?.id, salaryMin: adSalaryMin, salaryMax: adSalaryMax,
        type: 'full', skills: adNeed.split(/[,،]/).map((s: string) => s.trim()).filter(Boolean),
        descAr: `نبحث عن ${adTitle} للانضمام إلى فرعنا في ${hoodName(adHood)}. ${adNeed}`,
        descEn: `We are hiring a ${adTitleEn || adTitle} for our branch. ${adNeed}`,
        reqAr: adNeed.split(/[,،]/).map((s: string) => s.trim()).filter(Boolean),
        reqEn: adNeed.split(/[,،]/).map((s: string) => s.trim()).filter(Boolean),
        hoursAr: 'الأحد–الخميس', hoursEn: 'Sun–Thu', brandColor,
      });
      setMsg(lang === 'ar' ? 'تم النشر بنجاح' : 'Published');
      setAdOut(false); setAdTitle(''); setAdNeed('');
    } catch (e: any) { setMsg(e.message); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 fade-up">
      <div className="surface-card p-6 space-y-4">
        <h3 className="font-extrabold text-[#1B2A33] flex items-center gap-2"><BrainCircuit size={18} className="text-[#8B5CF6]" /> {t.emp.aiTitle}</h3>
        <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{t.emp.aiDesc}</p>
        <div className="flex items-center gap-2">
          <label className="field-label mb-0">{t.emp.brandColor}</label>
          <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-12 h-10 rounded-lg border border-[hsl(var(--border))] cursor-pointer" />
          <span className="tnum text-sm text-[hsl(var(--muted-foreground))]" dir="ltr">{brandColor}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="field-label">{t.emp.jobTitleIn} (ع)</label><input className="field" value={adTitle} onChange={e => setAdTitle(e.target.value)} /></div>
          <div><label className="field-label">(EN)</label><input className="field font-latin" dir="ltr" value={adTitleEn} onChange={e => setAdTitleEn(e.target.value)} /></div>
        </div>
        <div><label className="field-label">{t.emp.branch}</label>
          <select value={adHood} onChange={e => setAdHood(Number(e.target.value))} className="field">
            <option value={0}>—</option>
            <optgroup label={t.onboard.zoneWest}>{hoods.filter((h: any) => h.zone === 'west').map((n: any) => <option key={n.id} value={n.id}>{lang === 'ar' ? n.nameAr : n.nameEn}</option>)}</optgroup>
            <optgroup label={t.onboard.zoneSouth}>{hoods.filter((h: any) => h.zone === 'south').map((n: any) => <option key={n.id} value={n.id}>{lang === 'ar' ? n.nameAr : n.nameEn}</option>)}</optgroup>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="field-label">{t.jobs.salary} (min)</label><input type="number" className="field tnum" value={adSalaryMin} onChange={e => setAdSalaryMin(+e.target.value)} /></div>
          <div><label className="field-label">(max)</label><input type="number" className="field tnum" value={adSalaryMax} onChange={e => setAdSalaryMax(+e.target.value)} /></div>
        </div>
        <div><label className="field-label">{t.emp.need}</label><textarea rows={3} className="field" value={adNeed} onChange={e => setAdNeed(e.target.value)} placeholder="React, TypeScript…" /></div>
        <div className="flex items-center justify-between">
          <span className="chip chip-gold">{t.emp.cost}: <span className="tnum">{pricing.aiAdCost}</span> {t.emp.pts}</span>
          <button onClick={genAd} disabled={spend.isPending} className="btn btn-navy btn-md">{spend.isPending ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} {t.emp.genAd}</button>
        </div>
        {msg && <p className="text-xs font-bold text-[#b42318]">{msg}</p>}
      </div>
      <div>
        {adOut ? (
          <div className="fade-up rounded-2xl overflow-hidden border border-[hsl(var(--border))] shadow-xl">
            <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)` }}>
              <p className="text-[0.65rem] font-bold tracking-[0.2em] opacity-70 font-latin">WESTRIYADH.NET</p>
              <h3 className="text-2xl font-black mt-1">{adTitle || (lang === 'ar' ? 'مسمى الوظيفة' : 'Job Title')}</h3>
              <p className="text-sm opacity-80 mt-1 flex items-center gap-1.5"><MapPin size={13} /> {hoodName(adHood)}</p>
            </div>
            <div className="bg-white p-6 space-y-3 text-sm leading-relaxed">
              <p>{lang === 'ar' ? `نبحث عن ${adTitle} للانضمام إلى فرعنا في ${hoodName(adHood)}. المهارات: ${adNeed}` : `We are hiring a ${adTitleEn || adTitle} for our ${hoodName(adHood)} branch.`}</p>
              <p className="chip chip-gold"><Clock3 size={12} /> {lang === 'ar' ? 'زمن رحلتك محسوب تلقائياً عند التصفح' : 'Commute auto-calculated for seekers'}</p>
              <p className="tnum font-bold text-[hsl(var(--teal-700))]">{adSalaryMin.toLocaleString()}–{adSalaryMax.toLocaleString()} {t.jobs.sar}</p>
              <button onClick={publishAd} disabled={createJob.isPending} className="btn btn-gold btn-md w-full mt-2">{createJob.isPending ? <Loader2 size={15} className="animate-spin" /> : null} {t.emp.publish}</button>
            </div>
          </div>
        ) : (
          <div className="surface-card border-dashed !border-2 p-10 text-center text-[hsl(var(--muted-foreground))] text-sm h-full flex items-center justify-center">{t.emp.adPreview}</div>
        )}
      </div>
    </div>
  );
}

export function EmployerReports({ t }: any) {
  return (
    <div className="grid sm:grid-cols-3 gap-4 fade-up">
      {[[t.emp.rep1, '—'], [t.emp.rep2, '—'], [t.emp.rep3, '—']].map(([l, v], i) => (
        <div key={i} className="surface-card p-6 text-center">
          <p className="text-3xl font-black tnum text-[#1B2A33]">{v}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 font-semibold">{l}</p>
        </div>
      ))}
      <button className="btn btn-outline btn-md sm:col-span-3"><Download size={15} /> {t.emp.export}</button>
    </div>
  );
}
