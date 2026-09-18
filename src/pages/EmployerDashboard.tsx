import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';
import { MatchRing } from '@/components/shared';
import { EmployerAI, EmployerReports } from './employer-ai';
import { Clock3, MapPin, Loader2, Sparkles, Send, Eye, UserCheck, CalendarClock, XCircle, Trophy } from 'lucide-react';

type St = 'sent' | 'seen' | 'shortlist' | 'interview' | 'rejected' | 'hired';
const ST_META: Record<St, { cls: string; icon: any }> = {
  sent: { cls: 'st-sent', icon: Send }, seen: { cls: 'st-seen', icon: Eye },
  shortlist: { cls: 'st-short', icon: UserCheck }, interview: { cls: 'st-interview', icon: CalendarClock },
  rejected: { cls: 'st-rejected', icon: XCircle }, hired: { cls: 'st-hired', icon: Trophy },
};

// ─── لوحة صاحب العمل ─────────────────────────────────────────────────────────
export function EmployerDashboard() {
  const { t, lang, nav } = useStore();
  const { user, refresh } = useAuth();
  const utils = trpc.useUtils();
  const { data: hoods = [] } = trpc.platform.neighborhoods.useQuery();
  const { data: reasons = [] } = trpc.platform.rejectionReasons.useQuery();
  const { data: settings } = trpc.platform.settings.useQuery();
  const { data: my, isLoading } = trpc.platform.myJobs.useQuery();
  const { data: candidates = [] } = trpc.platform.candidates.useQuery();
  const setStatus = trpc.platform.setApplicationStatus.useMutation({ onSuccess: () => utils.platform.candidates.invalidate() });
  const spend = trpc.platform.spendPoints.useMutation({ onSuccess: () => { utils.platform.myJobs.invalidate(); refresh(); } });
  const createJob = trpc.platform.createJob.useMutation({ onSuccess: () => utils.platform.myJobs.invalidate() });

  const [tab, setTab] = useState<'jobs' | 'candidates' | 'ai' | 'reports'>('jobs');

  const pricing = settings?.pricing ?? { aiAdCost: 75, promote3: 120, promote7: 220 };
  const points = user?.points ?? 0;

  const hoodName = (id?: number | null) => { const h = hoods.find(x => x.id === id); return h ? (lang === 'ar' ? h.nameAr : h.nameEn) : '—'; };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="display-2 text-[#1B2A33]">{t.emp.title}</h1>
        <div className="flex items-center gap-2">
          <span className="chip chip-gold !px-4 !py-2 !text-sm">{t.emp.balance}: <span className="tnum font-black">{points}</span> {t.emp.pts}</span>
          <button onClick={() => nav({ name: 'wallet' })} className="btn btn-gold btn-md">{t.emp.charge}</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-6 mb-8">
        {([['jobs', t.emp.myJobs], ['candidates', t.emp.candidates], ['ai', t.emp.aiAd], ['reports', t.emp.reports]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as any)} className={`chip !px-4 !py-2 !text-[0.82rem] cursor-pointer ${tab === k ? 'chip-teal' : ''}`}>{l}</button>
        ))}
      </div>

      {tab === 'jobs' && (
        <div className="space-y-4 fade-up">
          {isLoading && <Loader2 className="animate-spin mx-auto text-[hsl(var(--teal-600))]" size={28} />}
          {!my?.company && !isLoading && (
            <div className="surface-card p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
              {lang === 'ar' ? 'أكمل بيانات منشأتك أولاً' : 'Complete your company profile first'}
              <button onClick={() => nav({ name: 'onboarding' })} className="btn btn-navy btn-sm ms-3">{t.onboard.save}</button>
            </div>
          )}
          {(my?.jobs.length ?? 0) > 0 && (
            <div className="overflow-x-auto surface-card">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] text-xs">
                  <th className="text-start p-4 font-bold">{t.emp.myJobs}</th><th className="text-start p-4 font-bold">{t.emp.applicantsCol}</th>
                  <th className="text-start p-4 font-bold">{t.emp.status}</th><th className="text-start p-4 font-bold">{t.emp.promote}</th>
                </tr></thead>
                <tbody>
                  {my!.jobs.map(j => (
                    <tr key={j.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--teal-50))]">
                      <td className="p-4 font-bold text-[#1B2A33]">{lang === 'ar' ? j.titleAr : j.titleEn}
                        <span className="block text-xs font-normal text-[hsl(var(--muted-foreground))]">{hoodName(j.hoodId)}</span>
                        {j.promoted && <span className="chip chip-gold !text-[0.62rem] mt-1"><Sparkles size={10} /> {t.jobs.promoted}</span>}
                      </td>
                      <td className="p-4 tnum font-bold">{j.applicants}</td>
                      <td className="p-4"><span className={`chip ${j.status === 'active' ? 'st-short' : 'st-rejected'}`}>{j.status === 'active' ? t.emp.active : t.emp.closed}</span></td>
                      <td className="p-4">
                        <div className="flex gap-1.5">
                          <button onClick={() => spend.mutate({ amount: pricing.promote3, kind: 'promote3', jobId: j.id })} className="chip chip-gold cursor-pointer !text-[0.68rem]">{t.emp.days3} · <span className="tnum">{pricing.promote3}</span></button>
                          <button onClick={() => spend.mutate({ amount: pricing.promote7, kind: 'promote7', jobId: j.id })} className="chip chip-gold cursor-pointer !text-[0.68rem]">{t.emp.week} · <span className="tnum">{pricing.promote7}</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'candidates' && (
        <div className="fade-up space-y-3">
          {candidates.length === 0 && <div className="surface-card p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">—</div>}
          {candidates.map(row => {
            const a = row.app, u = row.user;
            const speed = settings?.geo?.avgSpeed ?? 35.7;
            const mins = row.commuteKm !== null ? Math.round((row.commuteKm / speed) * 60) : null;
            return (
              <div key={a.id} className="surface-card p-5 flex flex-wrap items-center gap-4">
                <span className="w-12 h-12 rounded-full bg-[hsl(var(--teal-600))] text-white flex items-center justify-center font-black">{(u?.name ?? '؟')[0]}</span>
                <div className="flex-1 min-w-[180px]">
                  <p className="font-extrabold text-[#1B2A33]">{u?.name ?? '—'}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{lang === 'ar' ? (row.job as any)?.titleAr : (row.job as any)?.titleEn} · {u?.expYears ?? ''}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {mins !== null && <span className="chip chip-gold"><Clock3 size={11} /> ~{mins} {t.hero.min}</span>}
                    {u?.hood && <span className="chip"><MapPin size={11} /> {lang === 'ar' ? (u.hood as any).nameAr : (u.hood as any).nameEn}</span>}
                    {(u?.skills ?? []).slice(0, 4).map(s => <span key={s} className="chip !text-[0.65rem]">{s}</span>)}
                  </div>
                </div>
                <div className="text-center"><MatchRing value={a.matchScore ?? 70} size={52} /></div>
                <div className="flex gap-1.5 items-center flex-wrap">
                  <span className={`chip ${ST_META[a.status as St].cls}`}>{t.dash[('st' + a.status.charAt(0).toUpperCase() + a.status.slice(1)) as keyof typeof t.dash] as string}</span>
                  <button onClick={() => setStatus.mutate({ id: a.id, status: 'shortlist' })} className="btn btn-outline btn-sm">{t.emp.shortlist}</button>
                  <button onClick={() => setStatus.mutate({ id: a.id, status: 'interview' })} className="btn btn-outline btn-sm">{t.dash.stInterview}</button>
                  <select onChange={e => e.target.value && setStatus.mutate({ id: a.id, status: 'rejected', rejectionReason: e.target.value })}
                    className="btn btn-outline btn-sm !border-[#b42318]/30 !text-[#b42318] bg-white" defaultValue="">
                    <option value="" disabled>{t.emp.reject} *</option>
                    {reasons.map(r => <option key={r.id} value={lang === 'ar' ? r.textAr : r.textEn}>{lang === 'ar' ? r.textAr : r.textEn}</option>)}
                  </select>
                </div>
                {a.objection && <p className="w-full text-xs bg-[#fef7e0] border border-[#96700a]/20 rounded-lg p-2.5 text-[#96700a] font-semibold">⚠ {lang === 'ar' ? 'اعتراض بشري:' : 'Human objection:'} {a.objection}</p>}
              </div>
            );
          })}
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3">{t.emp.rejectionPick}</p>
        </div>
      )}

      {tab === 'ai' && <EmployerAI {...{ t, lang, points, pricing, settings, hoods, spend, createJob }} />}
      {tab === 'reports' && <EmployerReports {...{ t, lang }} />}
    </div>
  );
}
