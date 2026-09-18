import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';
import { BellRing, CheckCircle2, Send, Eye, UserCheck, CalendarClock, XCircle, Trophy, ShieldQuestion, Loader2 } from 'lucide-react';

type St = 'sent' | 'seen' | 'shortlist' | 'interview' | 'rejected' | 'hired';
const STAGES: St[] = ['sent', 'seen', 'shortlist', 'interview', 'hired'];
const ST_META: Record<St, { cls: string; icon: any }> = {
  sent: { cls: 'st-sent', icon: Send }, seen: { cls: 'st-seen', icon: Eye },
  shortlist: { cls: 'st-short', icon: UserCheck }, interview: { cls: 'st-interview', icon: CalendarClock },
  rejected: { cls: 'st-rejected', icon: XCircle }, hired: { cls: 'st-hired', icon: Trophy },
};

// ─── لوحة الباحث ─────────────────────────────────────────────────────────────
export function SeekerDashboard() {
  const { t, lang, nav } = useStore();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: apps = [], isLoading } = trpc.platform.myApplications.useQuery();
  const { data: hoods = [] } = trpc.platform.neighborhoods.useQuery();
  const objectMut = trpc.platform.objectApplication.useMutation({ onSuccess: () => utils.platform.myApplications.invalidate() });
  const [objText, setObjText] = useState<Record<number, string>>({});

  const stLabel: Record<St, string> = { sent: t.dash.stSent, seen: t.dash.stSeen, shortlist: t.dash.stShort, interview: t.dash.stInterview, rejected: t.dash.stRejected, hired: t.dash.stHired };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="display-2 text-[#1B2A33]">{t.dash.title}</h1>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mt-8">
        <div>
          <h2 className="font-extrabold text-lg text-[#1B2A33] mb-4 flex items-center gap-2">
            <Send size={17} className="text-[hsl(var(--teal-600))]" /> {t.dash.apps} <span className="chip chip-teal tnum">{apps.length}</span>
          </h2>
          {isLoading && <Loader2 className="animate-spin mx-auto text-[hsl(var(--teal-600))]" size={28} />}
          {!isLoading && apps.length === 0 && (
            <div className="surface-card p-10 text-center">
              <p className="text-[hsl(var(--muted-foreground))]">{t.dash.empty}</p>
              <button onClick={() => nav({ name: 'jobs' })} className="btn btn-navy btn-md mt-4">{t.dash.browse}</button>
            </div>
          )}
          <div className="space-y-4">
            {apps.map(a => {
              const job = a.job as any;
              const c = a.company as any;
              if (!job) return null;
              const meta = ST_META[a.status as St];
              const stageIdx = STAGES.indexOf(a.status === 'rejected' ? 'seen' : a.status as St);
              const jh = hoods.find(h => h.id === job.hoodId);
              return (
                <div key={a.id} className="surface-card p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black" style={{ background: c?.color ?? '#0F766E' }}>{c?.initials ?? '—'}</span>
                      <div>
                        <button onClick={() => nav({ name: 'job', id: job.id })} className="font-extrabold text-[#1B2A33] hover:text-[hsl(var(--teal-600))]">{lang === 'ar' ? job.titleAr : job.titleEn}</button>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{lang === 'ar' ? c?.nameAr : c?.nameEn} · {lang === 'ar' ? jh?.nameAr : jh?.nameEn}</p>
                      </div>
                    </div>
                    <span className={`chip ${meta.cls} !font-bold`}><meta.icon size={12} /> {stLabel[a.status as St]}</span>
                  </div>

                  <div className="flex items-center gap-1 mt-4">
                    {STAGES.map((s, j) => (
                      <React.Fragment key={s}>
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${j <= stageIdx && a.status !== 'rejected' ? 'bg-[#146c43]' : a.status === 'rejected' && j === stageIdx ? 'bg-[#b42318]' : 'bg-[hsl(var(--border))]'}`} />
                        {j < STAGES.length - 1 && <span className={`flex-1 h-0.5 ${j < stageIdx ? 'bg-[#146c43]' : 'bg-[hsl(var(--border))]'}`} />}
                      </React.Fragment>
                    ))}
                  </div>

                  {a.status === 'rejected' && (
                    <div className="mt-4 bg-[#fdecec] border border-[#b42318]/20 rounded-xl p-4">
                      <p className="text-xs font-bold text-[#b42318]">{t.dash.reason}</p>
                      <p className="text-sm font-semibold mt-1">{a.rejectionReason ?? '—'}</p>
                      {a.objection ? (
                        <p className="text-xs mt-3 text-[#146c43] font-bold flex items-center gap-1.5"><CheckCircle2 size={13} /> {t.dash.objectSent}</p>
                      ) : (
                        <div className="flex gap-2 mt-3">
                          <input className="field !py-1.5 text-xs flex-1" placeholder={t.dash.object}
                            value={objText[a.id] ?? ''} onChange={e => setObjText(p => ({ ...p, [a.id]: e.target.value }))} />
                          <button onClick={() => objectMut.mutate({ id: a.id, objection: objText[a.id] || t.dash.object })}
                            className="btn btn-outline btn-sm !border-[#b42318]/30 !text-[#b42318] shrink-0">
                            <ShieldQuestion size={13} /> {t.dash.object}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="surface-card p-5">
            <h3 className="font-extrabold text-sm text-[hsl(var(--muted-foreground))] mb-3 flex items-center gap-2"><BellRing size={15} className="text-[#F5A623]" /> {t.dash.notifications}</h3>
            <ul className="space-y-3 text-sm">
              {apps.filter(a => a.status === 'interview' || a.status === 'shortlist').map(a => (
                <li key={a.id} className="flex gap-2"><span className="w-2 h-2 rounded-full bg-[#F5A623] mt-1.5 shrink-0 pulse-dot" />{stLabel[a.status as St]} — {(a.job as any)?.titleAr}</li>
              ))}
              {apps.length === 0 && <li className="text-[hsl(var(--muted-foreground))] text-xs">—</li>}
            </ul>
          </div>
          <div className="surface-card p-5 text-sm">
            <p className="font-extrabold text-[#1B2A33]">{user?.name ?? '—'}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              {user?.hoodId ? (lang === 'ar' ? hoods.find(h => h.id === user.hoodId)?.nameAr : hoods.find(h => h.id === user.hoodId)?.nameEn) : '—'}
              {user?.lat && <span className="tnum block text-[0.62rem] opacity-60 mt-0.5" dir="ltr">{user.lat},{user.lng}</span>}
            </p>
            <button onClick={() => nav({ name: 'onboarding' })} className="btn btn-outline btn-sm w-full mt-3">{t.admin.edit}</button>
          </div>
          <button onClick={() => nav({ name: 'cv' })} className="btn btn-gold btn-md w-full">{t.nav.cv}</button>
        </aside>
      </div>
    </div>
  );
}
