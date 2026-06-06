import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, BookOpen, ChefHat, Dumbbell, Home, Settings, Shield, Target } from 'lucide-react';

const links = [
  ['/', 'Dashboard', Home],
  ['/diary', 'Diary', ChefHat],
  ['/foods', 'Foods', BookOpen],
  ['/weight', 'Weight', Dumbbell],
  ['/reports', 'Reports', BarChart3],
  ['/goals', 'Goals', Target],
  ['/settings', 'Settings', Settings],
  ['/admin', 'Admin', Shield]
] as const;

export function Layout() {
  return (
    <div className="min-h-screen lg:flex">
      <aside aria-label="Primary navigation" className="fixed bottom-0 z-20 flex w-full justify-around border-t bg-white p-2 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:flex-col lg:justify-start lg:border-r lg:p-6">
        <div className="hidden pb-8 lg:block">
          <h1 className="text-3xl font-black text-primary">Calo Việt</h1>
          <p className="text-sm text-slate-500">Nutrition tracking ecosystem</p>
        </div>
        {links.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} className="navlink" aria-label={label} end={to === '/'}>
            <Icon size={20} aria-hidden />
            <span className="hidden lg:inline">{label}</span>
          </NavLink>
        ))}
      </aside>
      <main className="mx-auto w-full max-w-7xl p-4 pb-24 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
