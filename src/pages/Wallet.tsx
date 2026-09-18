import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';
import { CheckCircle2, Loader2 } from 'lucide-react';

// ─── المحفظة والنقاط ─────────────────────────────────────────────────────────
export function Wallet() {
  const { t, nav } = useStore();
  const { user, refresh } = useAuth();
  const { data: settings } = trpc.platform.settings.useQuery();
  const { data: wallet } = trpc.platform.wallet.useQuery();
  const topUp = trpc.platform.topUp.useMutation({ onSuccess: () => { refresh(); setDone(true); setTimeout(() => setDone(false), 2500); } });
  const [done, setDone] = useState(false);
  const [gateway, setGateway] = useState('mada');

  const packages = settings?.pointsPackages ?? [];
  const payments = settings?.payments;
  const gateways = (['mada', 'applepay', 'visa', 'stcpay'] as const).filter(g => payments?.gateways?.[g]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="display-2 text-[#1B2A33]">{t.wallet.title}</h1>
      <p className="text-[hsl(var(--muted-foreground))] mt-2">{t.wallet.sub}</p>

      <div className="brand-panel rounded-3xl p-8 mt-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-white/55 text-sm font-bold">{t.wallet.balance}</p>
          <p className="text-5xl font-black text-white tnum mt-1">{(user?.points ?? 0).toLocaleString()} <span className="text-lg grad-text">{t.wallet.pts}</span></p>
        </div>
        {done && <span className="chip !bg-[#146c43] !text-white !border-transparent"><CheckCircle2 size={13} /> {t.wallet.chargeOk}</span>}
      </div>

      <h2 className="font-extrabold text-lg text-[#1B2A33] mt-10 mb-4">{t.wallet.choose}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.map((p: any, i: number) => (
          <div key={i} className={`surface-card p-6 text-center relative ${p.popular ? 'border-[#F5A623] ring-1 ring-[#F5A623]/40' : ''}`}>
            {p.popular && <span className="absolute -top-2.5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 chip chip-gold !text-[0.62rem]">★</span>}
            <p className="text-3xl font-black tnum text-[#1B2A33]">{p.points.toLocaleString()}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] font-bold">{t.wallet.pts}{p.bonus > 0 && <span className="text-[#146c43]"> +{p.bonus} {t.wallet.bonus}</span>}</p>
            <p className="text-xl font-black tnum text-[hsl(var(--teal-600))] mt-3">{p.price} <span className="text-xs">{t.wallet.sar}</span></p>
            <div className="flex justify-center gap-1.5 my-3">
              {gateways.map(g => (
                <button key={g} onClick={() => setGateway(g)} className={`chip cursor-pointer !text-[0.6rem] font-latin ${gateway === g ? 'chip-teal' : ''}`}>{t.admin[g]}</button>
              ))}
            </div>
            <button onClick={() => topUp.mutate({ points: p.points, bonus: p.bonus ?? 0, gateway })} disabled={topUp.isPending} className="btn btn-navy btn-sm w-full">
              {topUp.isPending && <Loader2 size={13} className="animate-spin" />} {t.wallet.buy}
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3">{t.wallet.payNote} {payments?.testMode && <span className="chip chip-gold !text-[0.62rem]">{t.admin.testMode}</span>}</p>

      <div className="mt-8 bg-[#F5A623]/10 border border-[#F5A623]/35 rounded-xl p-4 text-xs leading-relaxed text-[#96700a] font-semibold">
        {t.wallet.nonRefund}{' '}
        <button onClick={() => nav({ name: 'policies', slug: 'payment' })} className="underline underline-offset-2 font-black">{t.wallet.policy}</button>
      </div>

      {(wallet?.transactions.length ?? 0) > 0 && (
        <>
          <h2 className="font-extrabold text-lg text-[#1B2A33] mt-10 mb-4">{t.wallet.history}</h2>
          <div className="surface-card divide-y divide-[hsl(var(--border))]">
            {wallet!.transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="font-semibold">{tx.kind}{tx.note ? ` — ${tx.note}` : ''}</span>
                <span className={`tnum font-black ${tx.delta > 0 ? 'text-[#146c43]' : 'text-[#b42318]'}`}>{tx.delta > 0 ? '+' : ''}{tx.delta}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
