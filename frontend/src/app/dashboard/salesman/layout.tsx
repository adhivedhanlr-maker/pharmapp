'use client';

import {
    TrendingUp, Users, ShoppingCart,
    DollarSign, Route
} from "lucide-react";
import DashboardShell from "@/components/navigation/dashboard-shell";

export default function SalesmanLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        { icon: TrendingUp, label: "Dashboard", href: "/dashboard/salesman" },
        { icon: Users, label: "My Retailers", href: "/dashboard/salesman/retailers" },
        { icon: Route, label: "Route Plan", href: "/dashboard/salesman/route" },
        { icon: ShoppingCart, label: "Orders", href: "/dashboard/salesman/orders" },
        { icon: DollarSign, label: "Commission", href: "/dashboard/salesman/commission" },
    ];

    return (
        <DashboardShell
            roleLabel="Sales Pro"
            roleBadgeClassName="mt-1 border-primary/30 bg-primary/10 text-[10px] font-black uppercase tracking-widest text-primary"
            navItems={navItems}
        >
            {children}
        </DashboardShell>
    );
}
