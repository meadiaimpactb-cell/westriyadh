import React from 'react';

export const Row = ({ label, children, note }: { label: string; children: React.ReactNode; note?: string }) => (
  <div className="grid sm:grid-cols-[220px_1fr] gap-3 items-start py-4 border-b border-[hsl(var(--border))] last:border-0">
    <div><p className="text-sm font-bold text-[#1B2A33]">{label}</p>{note && <p className="text-[0.68rem] text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">{note}</p>}</div>
    <div>{children}</div>
  </div>
);

export const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
  <button onClick={() => onChange(!on)} className={`w-11 h-6 rounded-full transition-colors relative ${on ? 'bg-[#146c43]' : 'bg-[hsl(var(--border))]'}`}>
    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'start-[22px]' : 'start-0.5'}`} />
  </button>
);
