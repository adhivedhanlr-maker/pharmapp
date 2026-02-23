'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp, Package, Users, ShoppingCart, MapPin,
    DollarSign, Bell, LogOut, User, Route, Shield
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SalesmanLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const navItems = [
        { icon: TrendingUp, label: "Dashboard", href: "/dashboard/salesman" },
        { icon: Users, label: "My Retailers", href: "/dashboard/salesman/retailers" },
        { icon: Route, label: "Route Plan", href: "/dashboard/salesman/route" },
        { icon: ShoppingCart, label: "Orders", href: "/dashboard/salesman/orders" },
        { icon: DollarSign, label: "Commission", href: "/dashboard/salesman/commission" },
    ];

    return (
        <div className="flex h-screen bg-slate-900 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-68 bg-slate-900 border-r border-white/5 flex flex-col shadow-2xl relative z-40">
                <div className="p-6 border-b border-white/5">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-1.5 rounded-xl bg-primary transition-transform group-hover:scale-110 shadow-lg shadow-primary/20">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tighter">
                            Pharma<span className="text-primary flow">flow</span>
                        </span>
                    </Link>

                    <div className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-white truncate">{user?.name || 'Field Agent'}</p>
                            <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30 mt-0.5 font-black uppercase tracking-widest">Sales Pro</Badge>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-1">Territory Control</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.label} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start mb-1 h-11 rounded-xl transition-all ${isActive
                                            ? "text-primary bg-primary/10 font-black border border-primary/10 shadow-sm"
                                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? "text-primary" : "text-slate-500"}`} />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5 bg-black/20">
                    <Button
                        variant="ghost"
                        className="w-full justify-start h-11 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        onClick={() => { logout(); router.push('/login'); toast.success("Field Session Terminated"); }}
                    >
                        <LogOut className="h-4 w-4 mr-3" /> Terminate Session
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-slate-50 relative">
                {children}
            </main>
        </div>
    );
}
