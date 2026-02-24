'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Search, ShoppingCart, Package, CreditCard,
    LogOut, User, LayoutDashboard, Shield, Activity
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RetailerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/retailer" },
        { icon: Activity, label: "Stock Intelligence", href: "/dashboard/retailer/stock-intelligence" },
        { icon: Search, label: "Browse Medicines", href: "/search" },
        { icon: ShoppingCart, label: "My Orders", href: "/dashboard/retailer/orders" },
        { icon: Package, label: "Prescriptions", href: "/dashboard/retailer/prescriptions" },
        { icon: CreditCard, label: "Credit & Payments", href: "/dashboard/retailer/credit" },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-68 bg-white border-r hidden lg:flex flex-col shadow-sm relative z-40">
                <div className="p-6 border-b">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-1.5 rounded-xl bg-primary transition-transform group-hover:scale-110">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tighter">
                            Pharma<span className="text-primary flow">flow</span>
                        </span>
                    </Link>

                    <div className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate">{user?.name || 'Retailer'}</p>
                            <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200 mt-0.5 font-black uppercase tracking-widest">Active Store</Badge>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">Store Management</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.label} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start mb-1 h-11 rounded-xl transition-all ${isActive
                                            ? "text-primary bg-primary/5 font-black border border-primary/10 shadow-sm"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? "text-primary" : "text-slate-400"}`} />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t bg-slate-50/50">
                    <Button
                        variant="ghost"
                        className="w-full justify-start h-11 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => { logout(); router.push('/login'); toast.success("Successfully Logged Out"); }}
                    >
                        <LogOut className="h-4 w-4 mr-3" /> Terminate Session
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative">
                {children}
            </main>
        </div>
    );
}
