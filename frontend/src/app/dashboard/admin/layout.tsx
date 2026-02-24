'use client';

import { LayoutDashboard, Activity, Search, Code } from 'lucide-react';
import DashboardShell from '@/components/navigation/dashboard-shell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard/admin' },
    { icon: Activity, label: 'System', href: '/system-standard' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: Code, label: 'API', href: '/developer-api' },
  ];

  return (
    <DashboardShell
      roleLabel="Administrator"
      roleBadgeClassName="mt-1 border-violet-200 bg-violet-100 text-[10px] font-black uppercase tracking-widest text-violet-700"
      navItems={navItems}
    >
      {children}
    </DashboardShell>
  );
}
