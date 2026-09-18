import { useState } from 'react';
import { useStore } from '@/lib/store';
import { trpc } from '@/providers/trpc';
import { BarChart3, Users2, Briefcase, FileText, Megaphone, Tags, Coins, CreditCard, BrainCircuit, KeySquare, MapPinned, ScrollText, CheckCircle2 } from 'lucide-react';
import { DashTab, UsersTab, JobsTab } from './admin-tabs1';
import { ContentTab, AdsTab, PricingTab, PointsTab, PaymentsTab, AiTab, SocialTab } from './admin-tabs2';
import { GeoTab, PoliciesTab } from './admin-tabs3';

const TABS = [
  ['tDash', BarChart3], ['tUsers', Users2], ['tJobs', Briefcase], ['tContent', FileText],
  ['tAds', Megaphone], ['tPricing', Tags], ['tPoints', Coins], ['tPayments', CreditCard],
  ['tAi', BrainCircuit], ['tSocial', KeySquare], ['tGeo', MapPinned], ['tPolicies', ScrollText],
] as const;

export default function Admin() {
  const { t, lang } = useStore();
  const utils = trpc.useUtils();
  const { data: settings, refetch: refetchSettings } = trpc.platform.settings.useQuery();
  const { data: stats } = trpc.platform.admin.stats.useQuery();
  const { data: users = [] } = trpc.platform.admin.users.useQuery();
  const { data: hoods = [] } = trpc.platform.neighborhoods.useQuery();
  const { data: jobs = [] } = trpc.platform.jobs.useQuery();
  const { data: news = [] } = trpc.platform.news.useQuery();
  const { data: reasons = [] } = trpc.platform.rejectionReasons.useQuery();

  const setSetting = trpc.platform.admin.setSetting.useMutation({ onSuccess: () => { refetchSettings(); flash(); } });
  const addHood = trpc.platform.admin.addHood.useMutation({ onSuccess: () => { utils.platform.neighborhoods.invalidate(); flash(); } });
  const updateHood = trpc.platform.admin.updateHood.useMutation({ onSuccess: () => utils.platform.neighborhoods.invalidate() });
  const deleteHood = trpc.platform.admin.deleteHood.useMutation({ onSuccess: () => utils.platform.neighborhoods.invalidate() });
  const addNews = trpc.platform.admin.addNews.useMutation({ onSuccess: () => utils.platform.news.invalidate() });
  const deleteNews = trpc.platform.admin.deleteNews.useMutation({ onSuccess: () => utils.platform.news.invalidate() });
  const addReason = trpc.platform.admin.addReason.useMutation({ onSuccess: () => utils.platform.rejectionReasons.invalidate() });
  const closeJob = trpc.platform.admin.closeJob.useMutation({ onSuccess: () => utils.platform.jobs.invalidate() });
  const savePolicy = trpc.platform.admin.savePolicy.useMutation({ onSuccess: () => flash() });

  const [tab, setTab] = useState<(typeof TABS)[number][0]>('tDash');
  const [savedFlash, setSavedFlash] = useState(false);
  const flash = () => { setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1500); };
  const [newNews, setNewNews] = useState({ ar: '', en: '' });

  const kpi = settings?.kpi ?? {};
  const ads = settings?.ads ?? {};
  const pricing = settings?.pricing ?? {};
  const packages = settings?.pointsPackages ?? [];
  const payments = settings?.payments ?? { gateways: {}, urls: {} };
  const ai = settings?.ai ?? {};
  const social = settings?.social ?? {};
  const geo = settings?.geo ?? { avgSpeed: 35.7 };
  const seedManual = settings?.seedManual ?? true;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <span className="eyebrow">ADMIN</span>
          <h1 className="display-2 text-[#1B2A33] mt-2">{t.admin.title}</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2 max-w-xl">{t.admin.sub}</p>
        </div>
        {savedFlash && <span className="chip !bg-[#e8f7ef] !text-[#146c43] !px-4 !py-2"><CheckCircle2 size={14} /> {t.admin.saved}</span>}
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6 items-start">
        <aside className="surface-card p-3 lg:sticky lg:top-24 flex lg:flex-col gap-1 overflow-x-auto">
          {TABS.map(([k, Icon]) => (
            <button key={k} onClick={() => setTab(k)} className={`admin-link whitespace-nowrap ${tab === k ? 'active' : ''}`}>
              <Icon size={16} /> {t.admin[k]}
            </button>
          ))}
        </aside>

        <div className="surface-card p-6 lg:p-8 min-h-[480px]">
          {tab === 'tDash' && <DashTab {...{ t, stats, setSetting, seedManual, kpi }} />}
          {tab === 'tUsers' && <UsersTab {...{ t, users, hoods, lang }} />}
          {tab === 'tJobs' && <JobsTab {...{ t, jobs, lang, closeJob }} />}
          {tab === 'tContent' && <ContentTab {...{ t, settings, news, newNews, setNewNews, setSetting, addNews, deleteNews, lang }} />}
          {tab === 'tAds' && <AdsTab {...{ t, ads, setSetting }} />}
          {tab === 'tPricing' && <PricingTab {...{ t, pricing, setSetting }} />}
          {tab === 'tPoints' && <PointsTab {...{ t, packages, setSetting }} />}
          {tab === 'tPayments' && <PaymentsTab {...{ t, payments, setSetting }} />}
          {tab === 'tAi' && <AiTab {...{ t, ai, setSetting }} />}
          {tab === 'tSocial' && <SocialTab {...{ t, social, setSetting }} />}
          {tab === 'tGeo' && <GeoTab {...{ t, lang, hoods, geo, reasons, setSetting, addHood, updateHood, deleteHood, addReason }} />}
          {tab === 'tPolicies' && <PoliciesTab {...{ t, savePolicy }} />}
        </div>
      </div>
    </div>
  );
}
