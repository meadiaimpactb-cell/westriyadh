import { useMemo, useState } from 'react';
import { useStore, haversineKm } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';
import { JobCard, MatchRing, matchFor } from '@/components/shared';
import { MapPin, ListFilter, Loader2 } from 'lucide-react';

export default function Jobs() {
  const { t, nav } = useStore();
  const { user } = useAuth();
  const { data: hoods = [], isLoading } = trpc.platform.neighborhoods.useQuery();
  const { data: jobs = [] } = trpc.platform.jobs.useQuery();
  const { data: settings } = trpc.platform.settings.useQuery();
  const { data: myApps = [] } = trpc.platform.myApplications.useQuery(undefined, { enabled: !!user });

  const [type, setType] = useState('all');
  const [sort, setSort] = useState('nearest');
  const speed = settings?.geo?.avgSpeed ?? 35.7;
  const myHoodId = user?.hoodId ?? null;

  const list = useMemo(() => {
    const filtered = jobs.filter(j => type === 'all' || j.type === type);
    const hood = (id: number) => hoods.find(h => h.id === id);
    const arr = [...filtered];
    if (sort === 'nearest' && myHoodId) {
      const mh = hood(myHoodId);
      if (mh) arr.sort((a, b) => haversineKm(mh, hood(a.hoodId)!) - haversineKm(mh, hood(b.hoodId)!));
    } else if (sort === 'salary') arr.sort((a, b) => b.salaryMax - a.salaryMax);
    else if (sort === 'match') arr.sort((a, b) => matchFor(b.id, user?.id) - matchFor(a.id, user?.id));
    else arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return arr.sort((a, b) => Number(b.promoted) - Number(a.promoted));
  }, [jobs, type, sort, myHoodId, hoods, user?.id]);

  const appliedIds = new Set(myApps.map(a => a.jobId));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <span className="eyebrow"><span className="tnum">{list.length}</span> {t.jobs.results}</span>
          <h1 className="display-2 text-[#1B2A33] mt-2">{t.jobs.title}</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">{t.jobs.sub}</p>
        </div>
        {!myHoodId && (
          <button onClick={() => nav({ name: user ? 'dashboard' : 'auth' })} className="surface-card px-4 py-3 flex items-center gap-3 text-sm font-bold text-[hsl(var(--teal-700))] hover:border-[hsl(var(--teal-500))]">
            <MapPin size={17} className="text-[#F5A623]" /> {t.jobs.pickHood}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <ListFilter size={16} className="text-[hsl(var(--muted-foreground))]" />
        {(['all', 'full', 'part', 'shift'] as const).map(k => (
          <button key={k} onClick={() => setType(k)}
            className={`chip cursor-pointer transition-colors ${type === k ? 'chip-teal' : 'hover:border-[hsl(var(--teal-500))]'}`}>
            {k === 'all' ? t.jobs.allTypes : t.jobs[k]}
          </button>
        ))}
        <span className="mx-2 h-5 w-px bg-[hsl(var(--border))]" />
        {(['nearest', 'newest', 'salary', 'match'] as const).map(k => (
          <button key={k} onClick={() => setSort(k)}
            className={`chip cursor-pointer transition-colors ${sort === k ? 'chip-gold' : 'hover:border-[#F5A623]'}`}>
            {t.jobs[{ nearest: 'sortNearest', newest: 'sortNewest', salary: 'sortSalary', match: 'sortMatch' }[k] as keyof typeof t.jobs] as string}
          </button>
        ))}
      </div>

      {isLoading && <div className="text-center py-16"><Loader2 className="animate-spin mx-auto text-[hsl(var(--teal-600))]" size={32} /></div>}
      <div className="grid gap-4">
        {list.map(j => (
          <div key={j.id} className="flex items-center gap-3">
            <div className="flex-1">
              <JobCard job={j} hoods={hoods} myHoodId={myHoodId} speed={speed} applied={appliedIds.has(j.id)} onOpen={() => nav({ name: 'job', id: j.id })} />
            </div>
            <div className="hidden md:flex flex-col items-center gap-1 shrink-0">
              <MatchRing value={matchFor(j.id, user?.id)} />
              <span className="text-[0.65rem] font-bold text-[hsl(var(--muted-foreground))]">{t.jobs.match}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
