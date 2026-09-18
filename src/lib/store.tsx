import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STRINGS } from './i18n';
import type { Lang, Strings } from './i18n';

export type Route =
  | { name: 'home' } | { name: 'jobs' } | { name: 'job'; id: number }
  | { name: 'auth' } | { name: 'onboarding' } | { name: 'cv' }
  | { name: 'dashboard' } | { name: 'employer' } | { name: 'wallet' }
  | { name: 'admin' } | { name: 'policies'; slug?: string } | { name: 'guide'; role?: string };

interface Ctx {
  lang: Lang; t: Strings; dir: 'rtl' | 'ltr';
  setLang: (l: Lang) => void;
  route: Route; nav: (r: Route) => void;
}

const StoreCtx = createContext<Ctx>(null as any);
export const useStore = () => useContext(StoreCtx);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('wr_lang') as Lang) || 'ar');
  const [route, setRoute] = useState<Route>({ name: 'home' });

  useEffect(() => {
    localStorage.setItem('wr_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [route]);

  const value = useMemo<Ctx>(() => ({
    lang, t: STRINGS[lang], dir: lang === 'ar' ? 'rtl' : 'ltr',
    setLang, route, nav: setRoute,
  }), [lang, route]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

// ── أدوات جغرافية على العميل ────────────────────────────────────────────────
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) * 1.28;
}
export const commuteMinutes = (km: number, speed = 35.7) => Math.round((km / speed) * 60);

export function detectLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject(new Error('geolocation unsupported'));
    else navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
  });
}
