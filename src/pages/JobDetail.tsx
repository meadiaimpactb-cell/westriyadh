import { useState } from 'react';
import { useStore, haversineKm, commuteMinutes } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';
import { MatchRing, JobCard, matchFor } from '@/components/shared';
import { ArrowRight, ArrowLeft, MapPin, Clock3, BadgeCheck, Sparkles, CheckCircle2, AlertTriangle, BrainCircuit, Loader2 } from 'lucide-react';

export default function JobDetail({ id }: { id: number }) {
  const { t, lang, nav } = useStore();
  const { user, isAuthenticated } = useAuth();
  const { data: hoods = [] } = trpc.platform.neighborhoods.useQuery();
  const { data: jobs = [] } = trpc.platform.jobs.useQuery();
  const { data: settings } = trpc.platform.settings.useQuery();
  const utils = trpc.useUtils();
  const { data: myApps = [] } = trpc.platform.myApplications.useQuery(undefined, { enabled: !!user });
  const applyMut = trpc.platform.applyToJob.useMutation({ onSuccess: () => utils.platform.myApplications.invalidate() });

  const job = jobs.find(j => j.id === id);
  const [prepOpen, setPrepOpen] = useState(false);
  if (!job) return <div className="text-center py-24"><Loader2 className="animate-spin mx-auto text-[hsl(var(--teal-600))]" size={32} /></div>;

  const c = job.company;
  const Back = lang === 'ar' ? ArrowRight : ArrowLeft;
  const match = matchFor(job.id, user?.id);
  const jh = hoods.find(h => h.id === job.hoodId);
  const mh = hoods.find(h => h.id === user?.hoodId);
  const speed = settings?.geo?.avgSpeed ?? 35.7;
  const km = jh && mh ? haversineKm(mh, jh) : null;
  const mins = km !== null ? commuteMinutes(km, speed) : null;
  const applied = myApps.some(a => a.jobId === job.id);

  const mySkills: string[] = user?.skills ?? [];
  const jobSkills: string[] = job.skills ?? [];
  const matchedSkills = jobSkills.filter(s => mySkills.includes(s));
  const missingSkills = jobSkills.filter(s => !mySkills.includes(s));
  const similar = jobs.filter(j => j.id !== job.id).slice(0, 2);

  const prepQuestions = lang === 'ar' ? [
    `حدّثنا عن خبرتك في ${jobSkills[0] ?? 'مجالك'} وكيف طبّقتها في مشروع حقيقي؟`,
    'كيف تدير يوم عملك عند تزاحم المهام والمواعيد النهائية؟',
    `ما الذي تعرفه عن ${c?.nameAr ?? 'الشركة'} ولماذا اخترت التقديم لفرعنا في ${jh?.nameAr ?? ''}؟`,
    'اذكر موقفاً اختلفت فيه مع زميل أو مدير — كيف تصرفت؟',
    'أين ترى نموّك المهني خلال سنة من الآن؟',
  ] : [
    `Walk us through your experience with ${jobSkills[0] ?? 'your field'} in a real project.`,
    'How do you manage competing deadlines in your workday?',
    `What do you know about ${c?.nameEn ?? 'the company'}, and why our ${jh?.nameEn ?? ''} branch?`,
    'Tell me about a conflict with a colleague — how did you handle it?',
    'Where do you see your growth a year from now?',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={() => nav({ name: 'jobs' })} className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[#1B2A33] mb-6">
        <Back size={16} /> {t.job.back}
      </button>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div>
          <div className="surface-card p-6 lg:p-8">
            <div className="flex items-start gap-5">
              <span className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-white font-black text-2xl shrink-0" style={{ background: c?.color ?? '#0F766E' }}>{c?.initials ?? '—'}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="display-3 text-[#1B2A33]">{lang === 'ar' ? job.titleAr : job.titleEn}</h1>
                  {job.promoted && <span className="chip chip-gold"><Sparkles size={11} /> {t.jobs.promoted}</span>}
                </div>
                <p className="text-[hsl(var(--muted-foreground))] mt-1 flex items-center gap-1.5">
                  {lang === 'ar' ? c?.nameAr : c?.nameEn} {c?.verified && <BadgeCheck size={15} className="text-[hsl(var(--teal-600))]" />}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {mins !== null && <span className="chip chip-gold"><Clock3 size={12} /> ~{mins} {t.hero.min}</span>}
                  {km !== null && <span className="chip"><MapPin size={12} /> {lang === 'ar' ? jh?.nameAr : jh?.nameEn} · {km.toFixed(1)} {t.hero.km}</span>}
                  {km === null && jh && <span className="chip"><MapPin size={12} /> {lang === 'ar' ? jh.nameAr : jh.nameEn}</span>}
                  <span className="chip tnum">{job.salaryMin.toLocaleString()}–{job.salaryMax.toLocaleString()} {t.jobs.sar}</span>
                  <span className="chip">{t.jobs[job.type as 'full']}</span>
                  {job.hoursAr && <span className="chip">{lang === 'ar' ? job.hoursAr : job.hoursEn}</span>}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-[hsl(var(--border))]">
              {applied ? (
                <span className="btn btn-outline btn-lg text-[#146c43] border-[#146c43]/30 bg-[#e8f7ef]"><CheckCircle2 size={17} /> {t.job.appliedDone}</span>
              ) : (
                <button onClick={() => isAuthenticated ? applyMut.mutate({ jobId: job.id }) : nav({ name: 'auth' })}
                  disabled={applyMut.isPending}
                  className="btn btn-navy btn-lg">
                  {applyMut.isPending ? <Loader2 size={17} className="animate-spin" /> : null} {t.job.applyNow}
                </button>
              )}
              <button onClick={() => setPrepOpen(!prepOpen)} className="btn btn-gold btn-lg"><BrainCircuit size={17} /> {t.job.interviewPrep}</button>
            </div>
          </div>

          {prepOpen && (
            <div className="surface-card p-6 mt-4 border-[#F5A623]/40 bg-[#F5A623]/5 fade-up">
              <h3 className="font-extrabold text-[#1B2A33] flex items-center gap-2"><BrainCircuit size={18} className="text-[#F5A623]" /> {t.job.interviewPrep}</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 mb-4">{t.job.prepNote}</p>
              <ol className="space-y-3">
                {prepQuestions.map((q, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed bg-white rounded-xl border border-[hsl(var(--border))] p-3.5">
                    <span className="font-black text-[#F5A623] font-mono-num shrink-0">Q{i + 1}</span> {q}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="surface-card p-6 lg:p-8 mt-4">
            <h2 className="font-extrabold text-lg text-[#1B2A33] mb-3">{t.job.about}</h2>
            <p className="leading-loose">{lang === 'ar' ? job.descAr : job.descEn}</p>
            {(job.reqAr?.length ?? 0) > 0 && (
              <>
                <h2 className="font-extrabold text-lg text-[#1B2A33] mt-7 mb-3">{t.job.reqs}</h2>
                <ul className="space-y-2.5">
                  {((lang === 'ar' ? job.reqAr : job.reqEn) ?? []).map((r, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed"><CheckCircle2 size={16} className="text-[hsl(var(--teal-600))] shrink-0 mt-0.5" /> {r}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="surface-card p-6 text-center">
            <h3 className="font-extrabold text-sm text-[hsl(var(--muted-foreground))] mb-4">{t.job.matchTitle}</h3>
            <div className="flex justify-center"><MatchRing value={match} size={110} /></div>
            <div className="mt-5 text-start space-y-2">
              <p className="text-xs font-bold text-[#146c43] flex items-center gap-1.5"><CheckCircle2 size={13} /> {t.job.matched}</p>
              <div className="flex flex-wrap gap-1.5">{matchedSkills.length ? matchedSkills.map(s => <span key={s} className="chip !bg-[#e8f7ef] !border-[#146c43]/25 !text-[#146c43]">{s}</span>) : <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>}</div>
              <p className="text-xs font-bold text-[#96700a] flex items-center gap-1.5 pt-2"><AlertTriangle size={13} /> {t.job.missing}</p>
              <div className="flex flex-wrap gap-1.5">{missingSkills.map(s => <span key={s} className="chip">{s}</span>)}</div>
            </div>
          </div>
          {km !== null && mins !== null && (
            <div className="surface-card p-6">
              <h3 className="font-extrabold text-sm text-[hsl(var(--muted-foreground))] mb-4">{t.job.commute}</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="chip chip-teal">{lang === 'ar' ? mh?.nameAr : mh?.nameEn}</span>
                <span className="flex-1 mx-2 border-t-2 border-dashed border-[#F5A623] relative">
                  <MapPin size={14} className="absolute -top-2 left-1/2 -translate-x-1/2 text-[#F5A623] bg-white" />
                </span>
                <span className="chip chip-gold">{lang === 'ar' ? jh?.nameAr : jh?.nameEn}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5 text-center">
                <div className="rounded-xl bg-[hsl(var(--teal-50))] py-3"><div className="text-xl font-black tnum">{km.toFixed(1)}</div><div className="text-[0.68rem] text-[hsl(var(--muted-foreground))]">{t.hero.km}</div></div>
                <div className="rounded-xl bg-[#F5A623]/10 py-3"><div className="text-xl font-black tnum text-[#96700a]">~{mins}</div><div className="text-[0.68rem] text-[#96700a]">{t.hero.min}</div></div>
              </div>
            </div>
          )}
        </aside>
      </div>

      <h2 className="display-3 text-[#1B2A33] mt-14 mb-6">{t.job.similar}</h2>
      <div className="grid gap-4">
        {similar.map(j => <JobCard key={j.id} job={j} hoods={hoods} myHoodId={user?.hoodId} speed={speed} applied={myApps.some(a => a.jobId === j.id)} onOpen={() => nav({ name: 'job', id: j.id })} />)}
      </div>
    </div>
  );
}
