// ملف مرجعي: الخطوات 3-4 من صانع السيرة — مدمج داخل CvBuilder.tsx في النسخة النهائية
// AI generation step + preview/download step
import { BrainCircuit, Sparkles, Lock, Unlock, CheckCircle2, Loader2, Download, ImageDown } from 'lucide-react';

export const CvStepAI = (p: any) => (
  <div className="surface-card p-6 space-y-4 fade-up">
    <h3 className="font-extrabold text-[#1B2A33] flex items-center gap-2"><BrainCircuit size={18} className="text-[#8B5CF6]" /> {p.t.cv.aiTitle}</h3>
    {!p.aiReady && <p className="text-xs bg-[#F5A623]/10 border border-[#F5A623]/35 rounded-lg p-3 text-[#96700a] font-semibold">{p.t.cv.apiMissing}</p>}
    <div>
      <label className="field-label">{p.t.cv.tailorPick}</label>
      <select value={p.tailorId} onChange={e => p.setTailorId(Number(e.target.value))} className="field">
        <option value={0}>—</option>
        {p.jobs.map((j: any) => <option key={j.id} value={j.id}>{p.lang === 'ar' ? j.titleAr : j.titleEn}</option>)}
      </select>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <button onClick={p.genSummary} disabled={p.busy} className="btn btn-outline btn-sm"><Sparkles size={14} /> {p.t.cv.genSummary}</button>
      <button onClick={p.genSummary} disabled={p.busy} className="btn btn-outline btn-sm"><CheckCircle2 size={14} /> {p.t.cv.genAts}</button>
      <button onClick={p.genSummary} disabled={p.busy} className="btn btn-outline btn-sm"><Sparkles size={14} /> {p.t.cv.genTailor}</button>
      <button onClick={p.genGap} disabled={p.busy} className="btn btn-outline btn-sm"><BrainCircuit size={14} /> {p.t.cv.genGap}</button>
    </div>
    {p.busy && <p className="flex items-center gap-2 text-sm font-bold text-[#8B5CF6]"><Loader2 size={16} className="animate-spin" /> {p.t.cv.generating}</p>}
    {p.aiOut && !p.busy && (
      <div className="bg-[hsl(var(--teal-50))] border border-[hsl(var(--border))] rounded-xl p-4">
        <p className="text-xs font-bold text-[hsl(var(--teal-600))] mb-1.5">{p.t.cv.aiResult} · {p.t.cv.editHint}</p>
        <textarea className="field !bg-white" rows={4} value={p.aiOut} onChange={e => { p.setAiOut(e.target.value); p.up('summary', e.target.value); }} />
      </div>
    )}
    {p.gaps && !p.busy && (
      <div>
        <p className="text-xs font-bold text-[#96700a] mb-1.5">{p.t.cv.gapTitle} — {p.t.cv.gapNote}</p>
        <div className="flex flex-wrap gap-1.5">{p.gaps.length ? p.gaps.map((g: string) => <span key={g} className="chip">{g}</span>) : <span className="chip !bg-[#e8f7ef] !text-[#146c43]"><CheckCircle2 size={12} /> 100%</span>}</div>
      </div>
    )}
    <div className="flex gap-2"><button onClick={() => p.setStep(1)} className="btn btn-outline btn-md">{p.t.common.back}</button><button onClick={() => { p.persist(); p.setStep(3); }} className="btn btn-navy btn-md flex-1">{p.t.common.next}</button></div>
  </div>
);

export const CvStepPreview = (p: any) => (
  <div className="surface-card p-6 space-y-4 fade-up">
    <div className="grid grid-cols-2 gap-2">
      {(['ar', 'en'] as const).map(l => (
        <button key={l} onClick={() => p.setCvLang(l)} className={`btn btn-md ${p.cvLang === l ? 'btn-navy' : 'btn-outline'}`}>{l === 'ar' ? p.t.cv.langAr : p.t.cv.langEn}</button>
      ))}
    </div>
    <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed bg-[hsl(var(--teal-50))] rounded-lg p-3">{p.t.cv.brandingNote}</p>
    {p.logoFree ? (
      <p className="chip !bg-[#e8f7ef] !text-[#146c43] w-full justify-center !py-2"><Unlock size={13} /> {p.t.cv.logoRemoved}</p>
    ) : (
      <button onClick={() => p.setPayOpen(true)} className="btn btn-gold btn-md w-full"><Lock size={14} /> {p.t.cv.payNow} — <span className="tnum">{p.logoPrice}</span> {p.t.wallet.sar}</button>
    )}
    <div className="grid grid-cols-2 gap-2">
      <button onClick={() => window.print()} className="btn btn-navy btn-md"><Download size={15} /> {p.t.cv.downloadPdf}</button>
      <button onClick={p.downloadJpg} className="btn btn-outline btn-md"><ImageDown size={15} /> {p.t.cv.downloadJpg}</button>
    </div>
    <span className="chip !bg-[#e8f7ef] !text-[#146c43]"><CheckCircle2 size={12} /> {p.t.cv.atsOk}</span>
    <button onClick={() => p.setStep(2)} className="btn btn-outline btn-md w-full">{p.t.common.back}</button>
  </div>
);
