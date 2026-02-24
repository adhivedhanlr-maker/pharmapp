'use client';

import {
    Search, ShoppingCart, Package, CreditCard,
    LayoutDashboard, Activity
} from "lucide-react";
import DashboardShell from "@/components/navigation/dashboard-shell";

export default function RetailerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/retailer" },
        { icon: Activity, label: "Stock Intelligence", href: "/dashboard/retailer/stock-intelligence" },
        { icon: Search, label: "Browse Medicines", href: "/search" },
        { icon: ShoppingCart, label: "My Orders", href: "/dashboard/retailer/orders" },
        { icon: Package, label: "Prescriptions", href: "/dashboard/retailer/prescriptions" },
        { icon: CreditCard, label: "Credit & Payments", href: "/dashboard/retailer/credit" },
    ];

    return (
        <DashboardShell
            roleLabel="Active Store"
            roleBadgeClassName="mt-1 border-green-200 bg-green-100 text-[10px] font-black uppercase tracking-widest text-green-700"
            navItems={navItems}
        >
            {children}
        </DashboardShell>
    );
}
