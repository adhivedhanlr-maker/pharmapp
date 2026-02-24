'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Shield, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
};

type DashboardShellProps = {
  roleLabel: string;
  roleBadgeClassName: string;
  navItems: NavItem[];
  settingsHref?: string;
  children: React.ReactNode;
};

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardShell({
  roleLabel,
  roleBadgeClassName,
  navItems,
  settingsHref,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const onLogout = () => {
    logout();
    router.push('/login');
    toast.success('Session ended');
  };

  return (
    <div className="relative flex min-h-screen bg-transparent">
      <div className="pointer-events-none fixed inset-0 -z-10 premium-app-bg" />

      <aside className="hidden w-72 shrink-0 flex-col border-r border-white/60 bg-white/60 backdrop-blur-2xl lg:flex">
        <div className="border-b border-white/60 p-6">
          <Link href="/" className="group flex items-center gap-2">
            <div className="rounded-xl bg-primary p-1.5 transition-transform group-hover:scale-105">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Pharma<span className="text-primary">flow</span>
            </span>
          </Link>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 p-3 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-900">{user?.name || roleLabel}</p>
              <Badge className={roleBadgeClassName}>{roleLabel}</Badge>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`mb-1 h-11 w-full justify-start rounded-xl ${
                    active
                      ? 'border border-primary/10 bg-primary/10 font-black text-primary'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${active ? 'text-primary' : 'text-slate-400'}`} />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/60 bg-white/40 p-4">
          {settingsHref ? (
            <Link href={settingsHref}>
              <Button variant="ghost" className="mb-2 h-11 w-full justify-start rounded-xl text-slate-600">
                Settings
              </Button>
            </Link>
          ) : null}
          <Button
            variant="ghost"
            className="h-11 w-full justify-start rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600"
            onClick={onLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-white/70 bg-white/60 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-primary p-1.5">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-black tracking-tight text-slate-900">
                Pharma<span className="text-primary">flow</span>
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-slate-600"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-3 pb-28 pt-3 sm:px-4 lg:px-0 lg:pb-0 lg:pt-0">{children}</main>

        <nav className="liquid-bottom-nav fixed inset-x-3 bottom-3 z-40 lg:hidden">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-2 py-2">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={`mobile-${item.href}`}
                  href={item.href}
                  className={`flex min-w-[78px] shrink-0 flex-col items-center justify-center rounded-2xl px-3 py-2 text-[10px] font-bold tracking-wide transition ${
                    active ? 'bg-white/80 text-primary shadow-sm' : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  <item.icon className={`mb-1 h-4 w-4 ${active ? 'text-primary' : 'text-slate-500'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
