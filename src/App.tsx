import { StoreProvider, useStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';
import { Navbar, Footer } from '@/components/shared';
import Landing from '@/pages/Landing';
import Jobs from '@/pages/Jobs';
import JobDetail from '@/pages/JobDetail';
import { Auth, Onboarding } from '@/pages/Auth';
import CvBuilder from '@/pages/CvBuilder';
import { SeekerDashboard, EmployerDashboard, Wallet } from '@/pages/Dashboards';
import Admin from '@/pages/Admin';
import Policies from '@/pages/Policies';
import Guide from '@/pages/Guide';
import { Loader2 } from 'lucide-react';

function Guard({ need, children }: { need?: 'admin' | 'employer' | 'seeker'; children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { nav } = useStore();
  if (isLoading) return <div className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-[hsl(var(--teal-600))]" size={32} /></div>;
  if (!isAuthenticated) { nav({ name: 'auth' }); return null; }
  if (isAuthenticated && user && !user.profileDone) { nav({ name: 'onboarding' }); return null; }
  if (need === 'admin' && user?.role !== 'admin') { nav({ name: 'home' }); return null; }
  return <>{children}</>;
}

function Shell() {
  const { route } = useStore();
  const { data: settings } = trpc.platform.settings.useQuery();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {route.name === 'home' && <Landing />}
        {route.name === 'jobs' && <Jobs />}
        {route.name === 'job' && <JobDetail id={route.id} />}
        {route.name === 'auth' && <Auth />}
        {route.name === 'onboarding' && <Guard><Onboarding /></Guard>}
        {route.name === 'cv' && <Guard need="seeker"><CvBuilder /></Guard>}
        {route.name === 'dashboard' && <Guard need="seeker"><SeekerDashboard /></Guard>}
        {route.name === 'employer' && <Guard><EmployerDashboard /></Guard>}
        {route.name === 'wallet' && <Guard><Wallet /></Guard>}
        {route.name === 'admin' && <Guard need="admin"><Admin /></Guard>}
        {route.name === 'policies' && <Policies slug={route.slug} />}
        {route.name === 'guide' && <Guide role={route.role} />}
      </main>
      <Footer settings={settings} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
