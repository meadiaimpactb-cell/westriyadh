import { useState } from 'react';
import { Row, Toggle } from './admin-ui';
import { trpc } from '@/providers/trpc';
import { detectLocation } from '@/lib/store';
import { Plus, Trash2, Loader2, Crosshair, ListX } from 'lucide-react';

export function GeoTab({ t, lang, hoods, geo, reasons, setSetting, addHood, updateHood, deleteHood, addReason }: any) {
  const [newHood, setNewHood] = useState({ nameAr: '', nameEn: '', zone: 'west' as 'west' | 'south', lat: 0, lng: 0 });
  const [newReason, setNewReason] = useState({ ar: '', en: '' });
  const [locBusy, setLocBusy] = useState(false);
  return (
    <div className="fade-up">
      <Row label={t.admin.geoSpeed} note={t.admin.geoSpeedNote}>
        <input type="number" step="0.1" className="field tnum w-32" defaultValue={geo.avgSpeed}
          onBlur={e => setSetting.mutate({ key: 'geo', value: { ...geo, avgSpeed: +e.target.value || 35.7 } })} />
      </Row>

      <Row label={t.admin.geoList}>
        <div className="space-y-4">
          {/* إضافة حي */}
          <div className="rounded-xl border-2 border-dashed border-[hsl(var(--teal-500))/40] bg-[hsl(var(--teal-50))] p-4">
            <p className="text-xs font-black text-[hsl(var(--teal-700))] mb-3">{t.admin.geoAdd}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <input className="field" placeholder={t.admin.hoodName} value={newHood.nameAr} onChange={e => setNewHood(p => ({ ...p, nameAr: e.target.value }))} />
              <input className="field font-latin" dir="ltr" placeholder={t.admin.hoodNameEn} value={newHood.nameEn} onChange={e => setNewHood(p => ({ ...p, nameEn: e.target.value }))} />
              <select className="field" value={newHood.zone} onChange={e => setNewHood(p => ({ ...p, zone: e.target.value as any }))}>
                <option value="west">{t.onboard.zoneWest}</option><option value="south">{t.onboard.zoneSouth}</option>
              </select>
              <div className="flex gap-2">
                <input className="field tnum" dir="ltr" placeholder="lat" value={newHood.lat || ''} onChange={e => setNewHood(p => ({ ...p, lat: +e.target.value }))} />
                <input className="field tnum" dir="ltr" placeholder="lng" value={newHood.lng || ''} onChange={e => setNewHood(p => ({ ...p, lng: +e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setLocBusy(true); detectLocation().then(pos => { setNewHood(p => ({ ...p, lat: +pos.coords.latitude.toFixed(5), lng: +pos.coords.longitude.toFixed(5) })); setLocBusy(false); }).catch(() => setLocBusy(false)); }}
                className="btn btn-outline btn-sm">
                {locBusy ? <Loader2 size={13} className="animate-spin" /> : <Crosshair size={13} />} {t.admin.useMyLoc}
              </button>
              <button onClick={() => { if (newHood.nameAr && newHood.lat) { addHood.mutate(newHood); setNewHood({ nameAr: '', nameEn: '', zone: 'west', lat: 0, lng: 0 }); } }}
                disabled={addHood.isPending} className="btn btn-navy btn-sm"><Plus size={13} /> {t.admin.geoAdd}</button>
            </div>
          </div>

          {/* الجدول */}
          {(['west', 'south'] as const).map(zone => (
            <div key={zone}>
              <p className={`text-xs font-black mb-2 ${zone === 'west' ? 'text-[#146c43]' : 'text-[#96700a]'}`}>
                {zone === 'west' ? t.onboard.zoneWest : t.onboard.zoneSouth} — <span className="tnum">{hoods.filter((h: any) => h.zone === zone).length}</span>
              </p>
              <div className="space-y-1.5">
                {hoods.filter((h: any) => h.zone === zone).map((h: any) => (
                  <div key={h.id} className="flex items-center gap-2 border border-[hsl(var(--border))] rounded-lg px-3 py-2 flex-wrap">
                    <input className="field !py-1 !w-32 !text-xs" defaultValue={h.nameAr} onBlur={e => e.target.value !== h.nameAr && updateHood.mutate({ id: h.id, nameAr: e.target.value })} />
                    <input className="field !py-1 !w-32 !text-xs font-latin" dir="ltr" defaultValue={h.nameEn} onBlur={e => e.target.value !== h.nameEn && updateHood.mutate({ id: h.id, nameEn: e.target.value })} />
                    <span className="tnum text-[0.65rem] text-[hsl(var(--muted-foreground))]" dir="ltr">{h.lat},{h.lng}</span>
                    <span className="flex-1" />
                    <Toggle on={h.active} onChange={v => updateHood.mutate({ id: h.id, active: v })} />
                    <button onClick={() => deleteHood.mutate({ id: h.id })} className="btn btn-outline btn-sm !text-[#b42318] !py-1"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Row>

      {/* أسباب عدم القبول */}
      <Row label={t.admin.reasons}>
        <div className="space-y-2">
          {reasons.map((r: any) => (
            <div key={r.id} className="flex gap-2 items-center border border-[hsl(var(--border))] rounded-lg px-3 py-2">
              <ListX size={14} className="text-[#b42318] shrink-0" />
              <span className="text-sm flex-1">{lang === 'ar' ? r.textAr : r.textEn}</span>
            </div>
          ))}
          <div className="grid sm:grid-cols-2 gap-2">
            <input className="field" placeholder="(ع)" value={newReason.ar} onChange={e => setNewReason(p => ({ ...p, ar: e.target.value }))} />
            <input className="field font-latin" dir="ltr" placeholder="(EN)" value={newReason.en} onChange={e => setNewReason(p => ({ ...p, en: e.target.value }))} />
          </div>
          <button onClick={() => { if (newReason.ar && newReason.en) { addReason.mutate({ textAr: newReason.ar, textEn: newReason.en }); setNewReason({ ar: '', en: '' }); } }} className="btn btn-outline btn-sm"><Plus size={13} /> {t.admin.addReason}</button>
        </div>
      </Row>
    </div>
  );
}

export function PoliciesTab({ t, savePolicy }: any) {
  return (
    <div className="fade-up space-y-5">
      {['terms', 'privacy', 'payment', 'points', 'ai'].map(slug => (
        <PolicyEditor key={slug} slug={slug} title={(t.footer as any)[slug] ?? slug} onSave={(bodyAr, bodyEn) => savePolicy.mutate({ slug, bodyAr, bodyEn })} />
      ))}
    </div>
  );
}

export function PolicyEditor({ slug, title, onSave }: { slug: string; title: string; onSave: (ar: string, en: string) => void }) {
  const { data } = trpc.platform.policy.useQuery({ slug });
  return (
    <div className="border border-[hsl(var(--border))] rounded-xl p-4">
      <p className="field-label">{title}</p>
      <div className="grid sm:grid-cols-2 gap-2">
        <textarea rows={3} className="field text-xs" defaultValue={data?.bodyAr ?? ''} id={`pol-ar-${slug}`} placeholder="النص بالعربية" />
        <textarea rows={3} className="field text-xs font-latin" dir="ltr" defaultValue={data?.bodyEn ?? ''} id={`pol-en-${slug}`} placeholder="English text" />
      </div>
      <button onClick={() => onSave(
        (document.getElementById(`pol-ar-${slug}`) as HTMLTextAreaElement).value,
        (document.getElementById(`pol-en-${slug}`) as HTMLTextAreaElement).value,
      )} className="btn btn-outline btn-sm mt-2">حفظ / Save</button>
    </div>
  );
}
