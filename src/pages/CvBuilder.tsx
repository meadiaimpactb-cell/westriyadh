import { useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';
import { LogoMark } from '@/components/shared';
import { Link2, UploadCloud, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { CvStepAI, CvStepPreview } from './cv-steps-34';

const STEPS = ['stepData', 'stepLinks', 'stepAi', 'stepPreview'] as const;

export default function CvBuilder() {
  const { t, lang, nav } = useStore();
  const { user, isAuthenticated, refresh } = useAuth();
  const { data: settings } = trpc.platform.settings.useQuery();
  const { data: jobs = [] } = trpc.platform.jobs.useQuery();
  const saveCv = trpc.platform.saveCv.useMutation();
  const spend = trpc.platform.payCvLogo.useMutation({ onSuccess: () => refresh() });

  const [step, setStep] = useState(0);
  const [cvLang, setCvLang] = useState<'ar' | 'en'>(lang);
  const [busy, setBusy] = useState(false);
  const [tailorId, setTailorId] = useState<number>(0);
  const [aiOut, setAiOut] = useState('');
  const [gaps, setGaps] = useState<string[] | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [savedFlash, setSavedFlash] = useState(false);

  const ud = (user?.cvData as Record<string, string>) ?? {};
  const [cv, setCv] = useState({
    name: ud.name ?? user?.name ?? '', title: ud.title ?? '', phone: ud.phone ?? user?.phone ?? '', email: ud.email ?? user?.email ?? '',
    summary: user?.cvSummary ?? '', experience: ud.experience ?? '', education: ud.education ?? '',
    skills: (user?.skills ?? []).join('، '),
    linkedin: user?.links?.linkedin ?? '', twitter: user?.links?.twitter ?? '', other: user?.links?.other ?? '',
  });
  const up = (k: keyof typeof cv, v: string) => setCv(p => ({ ...p, [k]: v }));
  const aiReady = !!settings?.ai?.key;
  const logoPrice = settings?.pricing?.cvLogo ?? 29;
  const logoFree = user?.cvLogoFree ?? false;

  const persist = async () => {
    await saveCv.mutateAsync({
      summary: cv.summary || aiOut,
      skills: cv.skills.split(/[,،]/).map(s => s.trim()).filter(Boolean),
      links: { linkedin: cv.linkedin, twitter: cv.twitter, other: cv.other },
      data: { name: cv.name, title: cv.title, phone: cv.phone, email: cv.email, experience: cv.experience, education: cv.education },
    });
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1500);
  };

  const fakeAi = (fn: () => void) => { setBusy(true); setTimeout(() => { fn(); setBusy(false); }, 1400); };
  const skillsArr = cv.skills.split(/[,،]/).map(s => s.trim()).filter(Boolean);

  const genSummary = () => fakeAi(() => {
    const job = jobs.find(j => j.id === tailorId) ?? jobs[0];
    const txt = cvLang === 'ar'
      ? `${cv.title || 'محترف'} بخبرة عملية في ${(skillsArr.slice(0, 3).join('، ') || job?.skills?.slice(0, 2).join('، ') || 'مجالي')}. أتميز بدقة التنفيذ والالتزام، وأبحث عن فرصة ${job?.titleAr ?? ''} قريبة من نطاق سكني في غرب وجنوب الرياض أضيف فيها قيمة مباشرة لفريق العمل.`
      : `${cv.title || 'Professional'} with hands-on experience in ${(skillsArr.slice(0, 3).join(', ') || job?.skills?.slice(0, 2).join(', ') || 'my field')}. Seeking a ${job?.titleEn ?? ''} role close to home in West/South Riyadh.`;
    setAiOut(txt); up('summary', txt);
  });
  const genGap = () => fakeAi(() => {
    const job = jobs.find(j => j.id === tailorId) ?? jobs[0];
    const mine = skillsArr.map(s => s.toLowerCase());
    setGaps((job?.skills ?? []).filter(s => !mine.includes(s.toLowerCase())));
  });

  const downloadJpg = () => {
    const cnv = document.createElement('canvas'); cnv.width = 1000; cnv.height = 1414;
    const x = cnv.getContext('2d')!;
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, 1000, 1414);
    x.fillStyle = '#12232b'; x.fillRect(0, 0, 1000, 210);
    const grad = x.createLinearGradient(0, 0, 1000, 0);
    grad.addColorStop(0, '#2BB3A3'); grad.addColorStop(0.4, '#34C38F'); grad.addColorStop(0.7, '#F5A623'); grad.addColorStop(1, '#8B5CF6');
    x.fillStyle = grad; x.fillRect(0, 210, 1000, 8);
    x.fillStyle = '#ffffff'; x.font = '800 52px Tajawal, sans-serif'; x.textAlign = 'center';
    x.fillText(cv.name || '—', 500, 95);
    x.fillStyle = '#34C38F'; x.font = '600 30px Tajawal, sans-serif';
    x.fillText(cv.title || '', 500, 155);
    x.fillStyle = '#1B2A33'; x.textAlign = cvLang === 'ar' ? 'right' : 'left';
    const sx = cvLang === 'ar' ? 940 : 60;
    const section = (label: string, body: string, y: number) => {
      x.font = '800 26px Tajawal, sans-serif'; x.fillText(label, sx, y); y += 45;
      x.font = '400 22px Tajawal, sans-serif';
      const words = body.split(' '); let line = '';
      for (const w of words) { if (x.measureText(line + w).width > 880) { x.fillText(line, sx, y); y += 34; line = ''; } line += w + ' '; }
      x.fillText(line, sx, y); return y + 70;
    };
    let y = section(cvLang === 'ar' ? 'نبذة مهنية' : 'SUMMARY', cv.summary || aiOut || '—', 300);
    y = section(cvLang === 'ar' ? 'المهارات' : 'SKILLS', skillsArr.join(cvLang === 'ar' ? '، ' : ', ') || '—', y);
    y = section(cvLang === 'ar' ? 'الخبرات' : 'EXPERIENCE', cv.experience || '—', y);
    section(cvLang === 'ar' ? 'التعليم' : 'EDUCATION', cv.education || '—', y);
    if (!logoFree) {
      x.save(); x.globalAlpha = 0.07; x.translate(500, 760); x.rotate(-0.35);
      x.fillStyle = '#1B2A33'; x.font = '900 90px Tajawal, sans-serif'; x.textAlign = 'center';
      x.fillText('westriyadh.net', 0, 0); x.restore();
      x.globalAlpha = 1; x.fillStyle = '#2BB3A3'; x.font = '700 20px Tajawal, sans-serif'; x.textAlign = 'center';
      x.fillText('westriyadh.net', 500, 1370);
    }
    const a = document.createElement('a'); a.download = 'cv-westriyadh.jpg'; a.href = cnv.toDataURL('image/jpeg', 0.92); a.click();
  };

  if (!isAuthenticated) return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <p className="text-[hsl(var(--muted-foreground))] mb-4">{t.auth.realNote}</p>
      <button onClick={() => nav({ name: 'auth' })} className="btn btn-navy btn-lg">{t.nav.login}</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="max-w-2xl mb-8">
        <span className="eyebrow">AI CV</span>
        <h1 className="display-2 text-[#1B2A33] mt-2">{t.cv.title}</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-2">{t.cv.sub}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 items-center">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)}
            className={`chip !px-4 !py-2 !text-[0.8rem] cursor-pointer ${step === i ? 'chip-teal' : ''}`}>
            <span className="font-mono-num font-black">{i + 1}</span> {t.cv[s]}
          </button>
        ))}
        {savedFlash && <span className="chip !bg-[#e8f7ef] !text-[#146c43]"><CheckCircle2 size={13} /> {t.admin.saved}</span>}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div>
          {step === 0 && (
            <div className="surface-card p-6 space-y-4 fade-up">
              {[['name', t.cv.fullName], ['title', t.cv.jobTitle], ['phone', t.cv.phone], ['email', t.cv.email]].map(([k, l]) => (
                <div key={k}><label className="field-label">{l}</label><input className="field" value={(cv as any)[k]} onChange={e => up(k as any, e.target.value)} /></div>
              ))}
              {[['summary', t.cv.summary], ['experience', t.cv.experience], ['education', t.cv.education], ['skills', t.cv.skills]].map(([k, l]) => (
                <div key={k}><label className="field-label">{l}</label><textarea rows={k === 'skills' ? 2 : 3} className="field" value={(cv as any)[k]} onChange={e => up(k as any, e.target.value)} /></div>
              ))}
              <div className="flex gap-2">
                <button onClick={persist} disabled={saveCv.isPending} className="btn btn-outline btn-md">{saveCv.isPending ? <Loader2 size={14} className="animate-spin" /> : null} {t.admin.save}</button>
                <button onClick={() => setStep(1)} className="btn btn-navy btn-md flex-1">{t.common.next}</button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="surface-card p-6 space-y-4 fade-up">
              <h3 className="font-extrabold text-[#1B2A33] flex items-center gap-2"><Link2 size={18} className="text-[hsl(var(--teal-600))]" /> {t.cv.linksTitle}</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.cv.linksSub}</p>
              {[['linkedin', t.cv.linkedin], ['twitter', t.cv.twitter], ['other', t.cv.otherLink]].map(([k, l]) => (
                <div key={k}><label className="field-label">{l}</label><input dir="ltr" className="field font-latin" placeholder="https://" value={(cv as any)[k]} onChange={e => up(k as any, e.target.value)} /></div>
              ))}
              <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-[hsl(var(--border))] rounded-xl p-6 text-center hover:border-[hsl(var(--teal-500))] transition-colors">
                <UploadCloud size={26} className="mx-auto text-[hsl(var(--muted-foreground))]" />
                <p className="text-sm font-bold mt-2 text-[#1B2A33]">{t.cv.upload}</p>
                <input ref={fileRef} type="file" multiple accept=".pdf,image/*" className="hidden" onChange={e => setFiles(f => [...f, ...Array.from(e.target.files || []).map(x => x.name)])} />
              </button>
              {files.map((f, i) => <p key={i} className="chip w-full justify-start"><FileText size={12} /> {f}</p>)}
              <div className="flex gap-2"><button onClick={() => setStep(0)} className="btn btn-outline btn-md">{t.common.back}</button><button onClick={() => { persist(); setStep(2); }} className="btn btn-navy btn-md flex-1">{t.common.next}</button></div>
            </div>
          )}

          {step === 2 && <CvStepAI {...{ t, lang, aiReady, tailorId, setTailorId, jobs, genSummary, genGap, busy, aiOut, setAiOut, up, gaps, setStep, persist }} />}
          {step === 3 && <CvStepPreview {...{ t, cvLang, setCvLang, logoFree, setPayOpen, logoPrice, downloadJpg, setStep }} />}
        </div>

        {/* المعاينة الحية */}
        <div className="lg:sticky lg:top-24">
          <div id="cv-print" dir={cvLang === 'ar' ? 'rtl' : 'ltr'} className="cv-paper relative overflow-hidden max-w-[560px] mx-auto">
            {!logoFree && <div className="watermark-logo"><span className="font-black text-[64px] text-[#1B2A33] -rotate-[30deg] font-latin">westriyadh.net</span></div>}
            <div className="brand-panel px-8 py-7 relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">{cv.name || (cvLang === 'ar' ? 'الاسم الكامل' : 'Full Name')}</h2>
                  <p className="text-[#34C38F] font-bold mt-1">{cv.title || (cvLang === 'ar' ? 'المسمى المهني' : 'Professional Title')}</p>
                  <p className="text-white/50 text-xs mt-2 tnum" dir="ltr">{cv.phone} {cv.email && `· ${cv.email}`}</p>
                </div>
                {!logoFree && <span className="shrink-0 opacity-90"><LogoMark size={40} /></span>}
              </div>
            </div>
            <div className="h-1.5 grad-bar" />
            <div className="p-8 space-y-6 relative">
              <section>
                <h3 className="text-xs font-black tracking-[0.15em] text-[hsl(var(--teal-600))] mb-2">{cvLang === 'ar' ? 'نبذة مهنية' : 'SUMMARY'}</h3>
                <p className="text-sm leading-relaxed">{cv.summary || aiOut || '—'}</p>
              </section>
              <section>
                <h3 className="text-xs font-black tracking-[0.15em] text-[hsl(var(--teal-600))] mb-2">{cvLang === 'ar' ? 'المهارات' : 'SKILLS'}</h3>
                <div className="flex flex-wrap gap-1.5">{skillsArr.length ? skillsArr.map(s => <span key={s} className="chip">{s}</span>) : '—'}</div>
              </section>
              <section>
                <h3 className="text-xs font-black tracking-[0.15em] text-[hsl(var(--teal-600))] mb-2">{cvLang === 'ar' ? 'الخبرات' : 'EXPERIENCE'}</h3>
                <p className="text-sm leading-relaxed whitespace-pre-line">{cv.experience || '—'}</p>
              </section>
              <section>
                <h3 className="text-xs font-black tracking-[0.15em] text-[hsl(var(--teal-600))] mb-2">{cvLang === 'ar' ? 'التعليم' : 'EDUCATION'}</h3>
                <p className="text-sm">{cv.education || '—'}</p>
              </section>
              {(cv.linkedin || cv.twitter || cv.other) && (
                <section>
                  <h3 className="text-xs font-black tracking-[0.15em] text-[hsl(var(--teal-600))] mb-2">{cvLang === 'ar' ? 'الروابط' : 'LINKS'}</h3>
                  <div className="text-xs font-latin text-[hsl(var(--muted-foreground))] space-y-1" dir="ltr">
                    {cv.linkedin && <p>{cv.linkedin}</p>}{cv.twitter && <p>{cv.twitter}</p>}{cv.other && <p>{cv.other}</p>}
                  </div>
                </section>
              )}
            </div>
            {!logoFree && <div className="border-t border-[hsl(var(--border))] py-2.5 text-center text-[0.65rem] font-bold text-[hsl(var(--teal-600))] font-latin tracking-widest">WESTRIYADH.NET</div>}
          </div>
        </div>
      </div>

      {payOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPayOpen(false)}>
          <div className="surface-card max-w-sm w-full p-6 fade-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-lg text-[#1B2A33]">{t.cv.payNow}</h3>
            <p className="text-3xl font-black tnum text-[hsl(var(--teal-600))] my-3">{logoPrice} <span className="text-sm">{t.wallet.sar}</span></p>
            <div className="space-y-2 mb-4">
              {(['mada', 'applepay', 'visa', 'stcpay'] as const).filter(g => settings?.payments?.gateways?.[g]).map(g => (
                <button key={g} disabled={spend.isPending}
                  onClick={async () => {
                    try { await spend.mutateAsync({ gateway: g }); setPayOpen(false); }
                    catch { setPayOpen(false); }
                  }}
                  className="btn btn-outline btn-md w-full font-latin">{spend.isPending ? <Loader2 size={14} className="animate-spin" /> : null} {t.admin[g]}</button>
              ))}
            </div>
            <p className="text-[0.68rem] text-[hsl(var(--muted-foreground))] leading-relaxed">{t.wallet.payNote}</p>
            <button onClick={() => setPayOpen(false)} className="btn btn-outline btn-sm w-full mt-3">{t.common.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}
