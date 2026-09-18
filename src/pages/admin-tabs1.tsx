import { Toggle } from './admin-ui';

export function DashTab({ t, stats, setSetting, seedManual, kpi }: any) {
  return (
    <div className="fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[hsl(var(--teal-50))] rounded-xl p-4 mb-6">
        <div>
          <p className="font-extrabold text-sm text-[#1B2A33]">{t.admin.seedMode}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 max-w-lg leading-relaxed">{t.admin.seedNote}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold ${seedManual ? 'text-[#96700a]' : 'text-[#146c43]'}`}>{seedManual ? t.admin.seedOn : t.admin.seedOff}</span>
          <Toggle on={seedManual} onChange={v => setSetting.mutate({ key: 'seedManual', value: v })} />
        </div>
      </div>

      {/* أرقام حية من قاعدة البيانات */}
      <p className="text-xs font-black text-[#146c43] mb-3 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#146c43] pulse-dot" /> {t.admin.liveStats}</p>
      <div className="grid sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        {[t.admin.kpiSeekers, t.admin.kpiEmployers, t.admin.kpiJobs, t.admin.kpiApps, t.admin.kpiHires, t.footer.platform].map((l: string, i: number) => {
          const vals = [stats?.seekers, stats?.employers, stats?.jobs, stats?.applications, stats?.hired, stats?.users];
          return (
            <div key={i} className="rounded-xl bg-[hsl(var(--teal-50))] border border-[hsl(var(--teal-500))/20 p-4 text-center">
              <p className="text-2xl font-black tnum text-[hsl(var(--teal-700))]">{vals[i] ?? '…'}</p>
              <p className="text-[0.65rem] font-bold text-[hsl(var(--muted-foreground))] mt-1">{l}</p>
            </div>
          );
        })}
      </div>

      {seedManual && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {(['jobs', 'seekers', 'hires', 'saved', 'apps', 'employers'] as const).map(key => (
            <div key={key} className="border border-[hsl(var(--border))] rounded-xl p-5">
              <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2">{t.admin[('kpi' + key.charAt(0).toUpperCase() + key.slice(1)) as keyof typeof t.admin]}</p>
              <input type="number" className="field tnum w-36" value={kpi[key] ?? 0}
                onChange={e => setSetting.mutate({ key: 'kpi', value: { ...kpi, [key]: Number(e.target.value) || 0 } })} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function UsersTab({ t, users, hoods }: any) {
  return (
    <div className="fade-up overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
          <th className="text-start p-3">{t.admin.usersCol}</th><th className="text-start p-3">{t.admin.roleCol}</th>
          <th className="text-start p-3">{t.onboard.hood}</th><th className="text-start p-3">{t.emp.points}</th><th className="text-start p-3">GPS</th>
        </tr></thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--teal-50))]">
              <td className="p-3 font-bold">{u.name ?? '—'}<span className="block text-[0.65rem] font-normal text-[hsl(var(--muted-foreground))]">{u.email}</span></td>
              <td className="p-3"><span className={`chip ${u.role === 'admin' ? 'chip-purple' : u.accountType === 'employer' ? 'chip-gold' : ''}`}>{u.role === 'admin' ? t.admin.adminRole : u.accountType === 'employer' ? t.admin.employer : t.admin.seeker}</span></td>
              <td className="p-3 text-xs">{u.hoodId ? hoods.find((h: any) => h.id === u.hoodId)?.nameAr : '—'}</td>
              <td className="p-3 tnum font-bold">{u.points}</td>
              <td className="p-3 text-[0.65rem] tnum" dir="ltr">{u.lat ? `${u.lat},${u.lng}` : '—'}</td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-[hsl(var(--muted-foreground))]">—</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export function JobsTab({ t, jobs, lang, closeJob }: any) {
  return (
    <div className="fade-up">
      <p className="text-xs bg-[#F5A623]/10 border border-[#F5A623]/35 rounded-lg p-3 text-[#96700a] font-semibold mb-4">{t.admin.jobsModeration}</p>
      <div className="space-y-2">
        {jobs.map((j: any) => (
          <div key={j.id} className="flex items-center justify-between gap-3 border border-[hsl(var(--border))] rounded-xl px-4 py-3">
            <div className="text-sm"><b>{lang === 'ar' ? j.titleAr : j.titleEn}</b><span className="text-[hsl(var(--muted-foreground))]"> · {lang === 'ar' ? (j.company as any)?.nameAr : (j.company as any)?.nameEn}</span></div>
            <div className="flex gap-1.5 shrink-0 items-center">
              <span className={`chip ${j.status === 'active' ? 'st-short' : 'st-rejected'}`}>{j.status === 'active' ? t.emp.active : t.emp.closed}</span>
              <button onClick={() => closeJob.mutate({ id: j.id, status: j.status === 'active' ? 'closed' : 'active' })} className="btn btn-outline btn-sm">
                {j.status === 'active' ? t.admin.deactivate : t.admin.activate}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
