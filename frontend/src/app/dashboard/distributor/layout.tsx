'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    FileText,
    Settings,
    LogOut,
    User,
    Shield
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function DistributorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/distributor" },
        { icon: ShoppingCart, label: "Orders", href: "/dashboard/distributor/orders" },
        { icon: Package, label: "Inventory", href: "/dashboard/distributor/inventory" },
        { icon: Users, label: "Salesmen", href: "/dashboard/distributor/salesmen" },
        { icon: FileText, label: "Invoices", href: "/dashboard/distributor/invoices" },
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
                            Pharma<span className="text-primary">flow</span>
                        </span>
                    </Link>

                    <div className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">{user?.name || 'Distributor HQ'}</p>
                            <Badge className="text-[10px] bg-blue-100 text-blue-700 border-blue-200 mt-0.5 font-black uppercase tracking-widest">Partner</Badge>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">Command Center</p>
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
                    <Link href="/dashboard/distributor/settings">
                        <Button
                            variant="ghost"
                            className={`w-full justify-start mb-2 h-11 rounded-xl ${pathname === "/dashboard/distributor/settings"
                                    ? "text-primary bg-primary/5 font-black"
                                    : "text-slate-600"
                                }`}
                        >
                            <Settings className="h-5 w-5 mr-3 text-slate-400" /> Settings
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        className="w-full justify-start h-11 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => { logout(); router.push('/login'); toast.success("Securely Logged Out"); }}
                    >
                        <LogOut className="h-5 w-5 mr-3" /> Terminate Session
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
