import { useState } from 'react';
import { useStore } from '@/lib/store';
import { SectionHead, LogoMark } from '@/components/shared';
import { GUIDE_SEEKER, GUIDE_EMPLOYER } from './guide-content';
import type { RoleKey } from './guide-content';
import { GUIDE_ADMIN } from './guide-admin';

const CONTENT: Record<RoleKey, any> = {
  seeker: GUIDE_SEEKER,
  employer: GUIDE_EMPLOYER,
  admin: GUIDE_ADMIN,
};

export default function Guide({ role }: { role?: string }) {
  const { lang, nav, t } = useStore();
  const [active, setActive] = useState<RoleKey>((role as RoleKey) || 'seeker');
  const c = CONTENT[active];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <span className="inline-flex justify-center mb-4"><LogoMark size={64} /></span>
        <h1 className="display-2 text-[#1B2A33]">{lang === 'ar' ? 'دليل استخدام المنصة' : 'Platform User Guide'}</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-3 max-w-xl mx-auto">{t.footer.about}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto mb-10">
        {(Object.keys(CONTENT) as RoleKey[]).map(k => {
          const cc = CONTENT[k];
          return (
            <button key={k} onClick={() => setActive(k)}
              className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${active === k ? 'border-transparent text-white' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--teal-500))]'}`}
              style={active === k ? { background: cc.color } : {}}>
              <cc.icon size={22} />
              <span className="text-xs font-black">{lang === 'ar' ? cc.titleAr.replace('دليل ', '') : cc.titleEn.replace(' Guide', '')}</span>
            </button>
          );
        })}
      </div>

      <SectionHead title={lang === 'ar' ? c.titleAr : c.titleEn} sub={lang === 'ar' ? c.introAr : c.introEn} />
      <div className="space-y-4">
        {c.steps.map((s: any, i: number) => (
          <div key={i} className="surface-card p-5 flex gap-4 fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <span className="shrink-0 w-11 h-11 rounded-xl text-white flex items-center justify-center" style={{ background: c.color }}>
              <s.icon size={19} />
            </span>
            <div>
              <span className="font-mono-num font-black text-[0.7rem] text-[hsl(var(--muted-foreground))]">{String(i + 1).padStart(2, '0')}</span>
              <p className="text-sm leading-relaxed mt-1">{lang === 'ar' ? s.ar : s.en}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="brand-panel rounded-3xl p-8 mt-12 text-center">
        <h3 className="display-3 text-white">{lang === 'ar' ? 'جاهز تبدأ؟' : 'Ready to start?'}</h3>
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          <button onClick={() => nav({ name: 'auth' })} className="btn btn-gold btn-lg">{t.auth.register}</button>
          <button onClick={() => nav({ name: 'jobs' })} className="btn btn-ghost-light btn-lg">{t.nav.jobs}</button>
        </div>
      </div>
    </div>
  );
}
