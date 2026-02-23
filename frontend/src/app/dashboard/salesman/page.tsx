'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp, Package, Users, ShoppingCart, MapPin,
    DollarSign, Target, Bell, LogOut, User, Route
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const weekData = [
    { day: "Mon", orders: 6, commission: 1200 },
    { day: "Tue", orders: 9, commission: 1800 },
    { day: "Wed", orders: 4, commission: 800 },
    { day: "Thu", orders: 12, commission: 2400 },
    { day: "Fri", orders: 8, commission: 1600 },
    { day: "Sat", orders: 5, commission: 1000 },
    { day: "Sun", orders: 2, commission: 400 },
];

const customers = [
    { name: "City Medicals, Ernakulam", lastOrder: "2h ago", status: "Active", spend: 45000 },
    { name: "Krishna Pharmacy, Kochi", lastOrder: "1d ago", status: "Active", spend: 32000 },
    { name: "Amritha Medicos, Aluva", lastOrder: "3d ago", status: "Inactive", spend: 18000 },
    { name: "Sreekrishna Drugs", lastOrder: "5d ago", status: "Active", spend: 28000 },
];

export default function SalesmanDashboard() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const { data: orders } = useQuery({
        queryKey: ['salesman-orders'],
        queryFn: async () => {
            const res = await api.get('/orders/salesman');
            return res.data;
        },
    });

    const thisMonthCommission = 14200;
    const targetCommission = 25000;
    const progress = Math.round((thisMonthCommission / targetCommission) * 100);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 hidden lg:flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <span className="text-2xl font-black text-white">Pharma<span className="text-primary">App</span></span>
                    <div className="mt-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white truncate">{user?.name || 'Salesman'}</p>
                            <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30 mt-0.5">Salesman</Badge>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {[
                        { icon: TrendingUp, label: "Dashboard", href: "/dashboard/salesman", active: true },
                        { icon: Users, label: "My Retailers", href: "/dashboard/salesman/retailers" },
                        { icon: Route, label: "Route Plan", href: "/dashboard/salesman/route" },
                        { icon: ShoppingCart, label: "Orders", href: "/dashboard/salesman/orders" },
                        { icon: DollarSign, label: "Commission", href: "/dashboard/salesman/commission" },
                    ].map(({ icon: Icon, label, href, active }) => (
                        <Link key={label} href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-primary/20 text-primary" : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-red-400"
                        onClick={() => { logout(); router.push('/login'); toast.success("Logged out"); }}>
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                    </Button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div>
                        <h1 className="text-xl font-bold">Sales Dashboard</h1>
                        <p className="text-xs text-muted-foreground">February 2026 — Kerala Territory</p>
                    </div>
                    <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
                </header>

                <div className="p-6 space-y-6">
                    {/* Commission Target Card */}
                    <Card className="border-none bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-64 bg-gradient-to-l from-primary/20 to-transparent" />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Monthly Commission</p>
                                    <p className="text-4xl font-black mt-1">₹{thisMonthCommission.toLocaleString()}</p>
                                    <p className="text-slate-400 text-sm mt-1">Target: ₹{targetCommission.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 border border-primary/30">
                                        <Target className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="flex justify-between text-xs text-slate-400 mb-2">
                                    <span>Progress</span>
                                    <span className="font-bold text-white">{progress}%</span>
                                </div>
                                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Active Retailers", value: "28", icon: Users, color: "text-blue-600", bg: "bg-blue-50", change: "+2" },
                            { label: "Orders Today", value: "8", icon: ShoppingCart, color: "text-green-600", bg: "bg-green-50", change: "+3" },
                            { label: "Districts", value: "4", icon: MapPin, color: "text-orange-600", bg: "bg-orange-50", change: "" },
                            { label: "GMV", value: "₹2.4L", icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50", change: "+12%" },
                        ].map(({ label, value, icon: Icon, color, bg, change }) => (
                            <Card key={label} className="border-none shadow-sm">
                                <CardContent className="p-5">
                                    <div className={`inline-flex h-10 w-10 rounded-xl ${bg} items-center justify-center mb-3`}>
                                        <Icon className={`h-5 w-5 ${color}`} />
                                    </div>
                                    <p className="text-2xl font-black text-slate-900">{value}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs text-muted-foreground">{label}</p>
                                        {change && <span className="text-xs font-bold text-green-600">{change}</span>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-5">
                        {/* Orders Chart */}
                        <Card className="lg:col-span-3 border-none shadow-sm">
                            <CardHeader>
                                <CardTitle>Weekly Orders & Commission</CardTitle>
                                <CardDescription>Your performance this week</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weekData} barGap={4}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]}>
                                            {weekData.map((_, i) => (
                                                <Cell key={i} fill={i === 3 ? "hsl(var(--secondary))" : "hsl(var(--primary))"} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Top Retailers */}
                        <Card className="lg:col-span-2 border-none shadow-sm">
                            <CardHeader>
                                <CardTitle>My Retailers</CardTitle>
                                <CardDescription>Activity this month</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {customers.map((c) => (
                                    <div key={c.name} className="flex items-center gap-3 group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">{c.name}</p>
                                            <p className="text-xs text-muted-foreground">{c.lastOrder}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs font-bold text-slate-700">₹{(c.spend / 1000).toFixed(0)}k</p>
                                            <Badge variant="outline" className={`text-[9px] ${c.status === 'Active' ? 'text-green-700 border-green-200' : 'text-slate-400'}`}>
                                                {c.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full mt-2 text-sm" size="sm">
                                    View All Retailers <TrendingUp className="h-3.5 w-3.5 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
