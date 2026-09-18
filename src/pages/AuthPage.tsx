import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);
  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set('client_id', appID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'profile');
  url.searchParams.set('state', state);
  return url.toString();
}

const SocialIcons: Record<string, React.ReactNode> = {
  google: <svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5.1L1.3 17.2C3.3 21.2 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.2 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.3 6.8C.5 8.4 0 10.1 0 12s.5 3.6 1.3 5.2l3.9-2.9z"/><path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.8 1.3 6.8l3.9 2.9c.9-2.9 3.6-5 6.8-5z"/></svg>,
  twitter: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.2l7.3-8.3L1 2h6.5l4.4 5.9L18.9 2zm-1.1 18h1.7L7.1 3.8H5.3L17.8 20z"/></svg>,
  linkedin: <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.2V9h3.4v1.6h.1c.5-.9 1.7-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.3zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.5H3.5V9h3.6v11.5z"/></svg>,
  facebook: <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3v-3.5h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 1-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z"/></svg>,
};

export function Auth() {
  const { t, nav } = useStore();
  const { isAuthenticated } = useAuth();
  const { data: settings } = trpc.platform.settings.useQuery();
  const [agree, setAgree] = useState(false);
  const social = settings?.social ?? {};
  const providers = ['google', 'twitter', 'linkedin', 'facebook'] as const;

  if (isAuthenticated) { nav({ name: 'onboarding' }); return null; }
  const polLink = (slug: string, label: string) => (
    <button type="button" onClick={() => nav({ name: 'policies', slug })} className="text-[hsl(var(--teal-600))] font-bold underline underline-offset-2">{label}</button>
  );

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="surface-card p-8">
        <h1 className="display-3 text-[#1B2A33] text-center">{t.auth.welcome}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] text-center mt-2 mb-7">{t.auth.sub}</p>

        <button onClick={() => { if (agree) window.location.href = getOAuthUrl(); }} disabled={!agree} className="btn btn-navy btn-lg w-full">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {t.auth.kimi}
        </button>
        <p className="text-[0.7rem] text-[#146c43] text-center mt-2 font-semibold">{t.auth.realNote}</p>

        <label className="flex items-start gap-2.5 mt-5 cursor-pointer text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
          <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-0.5 accent-[#0F766E] w-4 h-4" />
          <span>
            {t.auth.agreePre} {polLink('terms', t.auth.terms)} {t.auth.agreeMid} {polLink('privacy', t.auth.privacy)} {t.auth.payment}.
            <br />{t.auth.agreeNote}
          </span>
        </label>

        <div className="flex items-center gap-3 my-5">
          <span className="flex-1 h-px bg-[hsl(var(--border))]" /><span className="text-xs text-[hsl(var(--muted-foreground))] font-bold">{t.auth.or}</span><span className="flex-1 h-px bg-[hsl(var(--border))]" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {providers.map(p => (
            <button key={p} disabled={!social[p]} title={social[p] ? '' : t.auth.socialNote}
              className={`btn btn-outline btn-md relative ${!social[p] ? 'opacity-50' : ''}`}>
              {SocialIcons[p]} {t.auth[p]}
              <span className={`absolute -top-1 -end-1 w-2.5 h-2.5 rounded-full ${social[p] ? 'bg-[#146c43]' : 'bg-[hsl(var(--border))]'}`} />
            </button>
          ))}
        </div>
        <p className="text-[0.68rem] text-[hsl(var(--muted-foreground))] text-center mt-4 leading-relaxed">{t.auth.socialNote}</p>
      </div>
    </div>
  );
}
