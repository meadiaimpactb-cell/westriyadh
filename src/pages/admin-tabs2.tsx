import { Row, Toggle } from './admin-ui';
import { Plus, Trash2 } from 'lucide-react';

export function ContentTab({ t, settings, news, newNews, setNewNews, setSetting, addNews, deleteNews, lang }: any) {
  return (
    <div className="fade-up">
      <Row label={t.admin.heroTitle}><input className="field" defaultValue={settings?.heroTitle ?? ''} placeholder={t.tagline} onBlur={e => setSetting.mutate({ key: 'heroTitle', value: e.target.value })} /></Row>
      <Row label={t.admin.heroSub}><textarea rows={2} className="field" defaultValue={settings?.heroSub ?? ''} onBlur={e => setSetting.mutate({ key: 'heroSub', value: e.target.value })} /></Row>
      <Row label={t.admin.news}>
        <div className="space-y-2">
          {news.map((n: any) => (
            <div key={n.id} className="flex gap-2 items-center border border-[hsl(var(--border))] rounded-lg px-3 py-2">
              <span className="text-sm flex-1">{lang === 'ar' ? n.textAr : n.textEn}</span>
              <button onClick={() => deleteNews.mutate({ id: n.id })} className="btn btn-outline btn-sm !text-[#b42318] shrink-0"><Trash2 size={13} /></button>
            </div>
          ))}
          <div className="grid sm:grid-cols-2 gap-2">
            <input className="field" placeholder={t.admin.newsText + ' (ع)'} value={newNews.ar} onChange={e => setNewNews((p: any) => ({ ...p, ar: e.target.value }))} />
            <input className="field font-latin" dir="ltr" placeholder="News (EN)" value={newNews.en} onChange={e => setNewNews((p: any) => ({ ...p, en: e.target.value }))} />
          </div>
          <button onClick={() => { if (newNews.ar && newNews.en) { addNews.mutate({ textAr: newNews.ar, textEn: newNews.en }); setNewNews({ ar: '', en: '' }); } }} className="btn btn-outline btn-sm"><Plus size={13} /> {t.admin.addNews}</button>
        </div>
      </Row>
    </div>
  );
}

export function AdsTab({ t, ads, setSetting }: any) {
  return (
    <div className="fade-up">
      <Row label={t.admin.adTop}>
        <div className="flex items-center gap-3 flex-wrap">
          <Toggle on={!!ads.topEnabled} onChange={v => setSetting.mutate({ key: 'ads', value: { ...ads, topEnabled: v } })} />
          <input className="field flex-1 min-w-[220px]" defaultValue={ads.topAr ?? ''} onBlur={e => setSetting.mutate({ key: 'ads', value: { ...ads, topAr: e.target.value } })} />
          <input type="number" className="field tnum w-28" defaultValue={ads.topPrice ?? 0} onBlur={e => setSetting.mutate({ key: 'ads', value: { ...ads, topPrice: +e.target.value } })} />
          <input className="field w-48 font-latin" dir="ltr" placeholder="https://" defaultValue={ads.topLink ?? ''} onBlur={e => setSetting.mutate({ key: 'ads', value: { ...ads, topLink: e.target.value } })} />
        </div>
      </Row>
      <Row label={t.admin.adBottom}>
        <div className="flex items-center gap-3 flex-wrap">
          <Toggle on={!!ads.bottomEnabled} onChange={v => setSetting.mutate({ key: 'ads', value: { ...ads, bottomEnabled: v } })} />
          <input type="number" className="field tnum w-28" defaultValue={ads.bottomPrice ?? 0} onBlur={e => setSetting.mutate({ key: 'ads', value: { ...ads, bottomPrice: +e.target.value } })} />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">{t.admin.adPrice}</span>
        </div>
      </Row>
    </div>
  );
}

export function PricingTab({ t, pricing, setSetting }: any) {
  return (
    <div className="fade-up">
      {([['cvPrice', 'cvLogo'], ['promote3', 'promote3'], ['promote7', 'promote7']] as const).map(([label, key]) => (
        <Row key={key} label={t.admin[label]}>
          <input type="number" className="field tnum w-36" defaultValue={pricing[key] ?? 0}
            onBlur={e => setSetting.mutate({ key: 'pricing', value: { ...pricing, [key]: +e.target.value } })} />
        </Row>
      ))}
      <Row label={t.emp.cost + ' AI'}>
        <input type="number" className="field tnum w-36" defaultValue={pricing.aiAdCost ?? 75}
          onBlur={e => setSetting.mutate({ key: 'pricing', value: { ...pricing, aiAdCost: +e.target.value } })} />
      </Row>
    </div>
  );
}

export function PointsTab({ t, packages, setSetting }: any) {
  return (
    <div className="fade-up">
      <div className="grid sm:grid-cols-2 gap-3">
        {packages.map((p: any, i: number) => (
          <div key={i} className="border border-[hsl(var(--border))] rounded-xl p-4 flex items-end gap-3 flex-wrap">
            <div><label className="field-label">{t.admin.pkgPts}</label><input type="number" className="field tnum w-28" defaultValue={p.points}
              onBlur={e => setSetting.mutate({ key: 'pointsPackages', value: packages.map((x: any, j: number) => j === i ? { ...x, points: +e.target.value } : x) })} /></div>
            <div><label className="field-label">{t.admin.pkgPrice}</label><input type="number" className="field tnum w-24" defaultValue={p.price}
              onBlur={e => setSetting.mutate({ key: 'pointsPackages', value: packages.map((x: any, j: number) => j === i ? { ...x, price: +e.target.value } : x) })} /></div>
            <div><label className="field-label">{t.admin.pkgBonus}</label><input type="number" className="field tnum w-24" defaultValue={p.bonus}
              onBlur={e => setSetting.mutate({ key: 'pointsPackages', value: packages.map((x: any, j: number) => j === i ? { ...x, bonus: +e.target.value } : x) })} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PaymentsTab({ t, payments, setSetting }: any) {
  return (
    <div className="fade-up">
      {(['mada', 'applepay', 'visa', 'stcpay'] as const).map(g => (
        <Row key={g} label={t.admin[g]}>
          <div className="flex items-center gap-3 flex-wrap">
            <Toggle on={!!payments.gateways?.[g]} onChange={v => setSetting.mutate({ key: 'payments', value: { ...payments, gateways: { ...payments.gateways, [g]: v } } })} />
            <input className="field flex-1 min-w-[240px] font-latin" dir="ltr" placeholder={t.admin.gatewayUrl} defaultValue={payments.urls?.[g] ?? ''}
              onBlur={e => setSetting.mutate({ key: 'payments', value: { ...payments, urls: { ...payments.urls, [g]: e.target.value } } })} />
          </div>
        </Row>
      ))}
      <Row label={t.admin.testMode}><Toggle on={!!payments.testMode} onChange={v => setSetting.mutate({ key: 'payments', value: { ...payments, testMode: v } })} /></Row>
    </div>
  );
}

export function AiTab({ t, ai, setSetting }: any) {
  return (
    <div className="fade-up">
      <Row label={t.admin.aiProvider}>
        <select className="field max-w-xs" defaultValue={ai.provider ?? ''} onChange={e => setSetting.mutate({ key: 'ai', value: { ...ai, provider: e.target.value } })}>
          <option value="">—</option><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option>
          <option value="google">Google Gemini</option><option value="azure">Azure OpenAI</option><option value="custom">Custom endpoint</option>
        </select>
      </Row>
      <Row label={t.admin.aiKey}><input className="field font-latin" dir="ltr" type="password" placeholder="sk-…" defaultValue={ai.key ?? ''} onBlur={e => setSetting.mutate({ key: 'ai', value: { ...ai, key: e.target.value } })} /></Row>
      <Row label={t.admin.aiModel}><input className="field font-latin max-w-xs" dir="ltr" placeholder="gpt-4o / claude-4 …" defaultValue={ai.model ?? ''} onBlur={e => setSetting.mutate({ key: 'ai', value: { ...ai, model: e.target.value } })} /></Row>
      <Row label={t.admin.aiCost} note={t.admin.aiCostNote}>
        <span className={`chip ${ai.key ? '!bg-[#e8f7ef] !text-[#146c43]' : 'chip-gold'}`}>{ai.key ? t.admin.connected : t.admin.notConnected}</span>
      </Row>
    </div>
  );
}

export function SocialTab({ t, social, setSetting }: any) {
  return (
    <div className="fade-up">
      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">{t.admin.socialNote}</p>
      {(['google', 'twitter', 'linkedin', 'facebook'] as const).map(p => (
        <Row key={p} label={t.auth[p]}>
          <input className="field font-latin" dir="ltr" placeholder={t.admin.socialClient + ' / ' + t.admin.socialSecret} defaultValue={social[p] ?? ''}
            onBlur={e => setSetting.mutate({ key: 'social', value: { ...social, [p]: e.target.value } })} />
        </Row>
      ))}
    </div>
  );
}
