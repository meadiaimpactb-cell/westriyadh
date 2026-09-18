import React from 'react';
import { useStore } from '@/lib/store';
import { trpc } from '@/providers/trpc';
import { DEFAULTS } from './policy-defaults';
import { ScrollText, ShieldCheck, CreditCard, Coins, BrainCircuit } from 'lucide-react';

const SLUGS = ['terms', 'privacy', 'payment', 'points', 'ai'] as const;
const ICONS: Record<string, any> = { terms: ScrollText, privacy: ShieldCheck, payment: CreditCard, points: Coins, ai: BrainCircuit };

export default function Policies({ slug }: { slug?: string }) {
  const { t, lang, nav } = useStore();
  const active = (SLUGS.includes(slug as any) ? slug : 'terms') as string;
  const { data: dbPolicy } = trpc.platform.policy.useQuery({ slug: active });
  const T = t.policies as any;
  const titles: Record<string, string> = { terms: T.termsT, privacy: T.privacyT, payment: T.paymentT, points: T.pointsT, ai: T.aiT };

  const dbBody = lang === 'ar' ? dbPolicy?.bodyAr : dbPolicy?.bodyEn;
  const fallback = DEFAULTS[active][lang === 'ar' ? 'ar' : 'en'];
  const useDb = dbBody && !dbBody.includes('تُحرَّر من لوحة الإدارة') && !dbBody.includes('editable from the admin panel');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="display-2 text-[#1B2A33]">{t.policies.title}</h1>
      <p className="text-[hsl(var(--muted-foreground))] mt-2 mb-8">{t.policies.sub}</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {SLUGS.map(s => (
          <button key={s} onClick={() => nav({ name: 'policies', slug: s })}
            className={`chip !px-4 !py-2 !text-[0.8rem] cursor-pointer ${active === s ? 'chip-teal' : ''}`}>{titles[s]}</button>
        ))}
      </div>
      <div className="surface-card p-7 lg:p-9">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-10 h-10 rounded-xl grad-bar text-white flex items-center justify-center">
            {React.createElement(ICONS[active], { size: 18 })}
          </span>
          <h2 className="display-3 text-[#1B2A33]">{titles[active]}</h2>
        </div>
        {useDb ? (
          <p className="text-sm leading-loose whitespace-pre-line">{dbBody}</p>
        ) : (
          <div className="space-y-5">
            {fallback.map((p, i) => {
              const [head, ...rest] = p.split(': ');
              return (
                <div key={i} className="flex gap-4">
                  <span className="font-black text-[#2BB3A3] font-mono-num text-sm shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <p className="text-sm leading-loose"><b className="text-[#1B2A33]">{head}:</b> {rest.join(': ')}</p>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-[0.7rem] text-[hsl(var(--muted-foreground))] mt-8 pt-5 border-t border-[hsl(var(--border))]">
          {t.brand} — {t.domain} · 2026
        </p>
      </div>
    </div>
  );
}
