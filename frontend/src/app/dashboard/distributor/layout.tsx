'use client';

import { LayoutDashboard, Package, ShoppingCart, Users, FileText } from "lucide-react";
import DashboardShell from "@/components/navigation/dashboard-shell";

export default function DistributorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/distributor" },
        { icon: ShoppingCart, label: "Orders", href: "/dashboard/distributor/orders" },
        { icon: Package, label: "Inventory", href: "/dashboard/distributor/inventory" },
        { icon: Users, label: "Salesmen", href: "/dashboard/distributor/salesmen" },
        { icon: FileText, label: "Invoices", href: "/dashboard/distributor/invoices" },
    ];

    return (
        <DashboardShell
            roleLabel="Partner"
            roleBadgeClassName="mt-1 border-blue-200 bg-blue-100 text-[10px] font-black uppercase tracking-widest text-blue-700"
            navItems={navItems}
            settingsHref="/dashboard/distributor/settings"
        >
            {children}
        </DashboardShell>
    );
}
