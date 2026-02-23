'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Search, ShoppingCart, Package, Clock, TrendingUp, CreditCard,
    ChevronRight, RefreshCcw, Bell, LogOut, User
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ORDER_STATUS_COLOR: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    ACCEPTED: "bg-blue-100 text-blue-800 border-blue-200",
    SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_STEPS = ["PENDING", "ACCEPTED", "SHIPPED", "DELIVERED"];

export default function RetailerDashboard() {
    const { user, logout } = useAuthStore();
    const cartItems = useCartStore((s) => s.items);
    const router = useRouter();
    const [quickSearch, setQuickSearch] = useState("");

    const { data: orders, isLoading } = useQuery({
        queryKey: ['retailer-orders'],
        queryFn: async () => {
            const res = await api.get('/orders/retailer');
            return res.data;
        },
    });

    const stats = {
        totalOrders: orders?.length || 0,
        pending: orders?.filter((o: any) => o.status === 'PENDING').length || 0,
        delivered: orders?.filter((o: any) => o.status === 'DELIVERED').length || 0,
        totalSpend: orders?.reduce((s: number, o: any) => s + o.totalAmount, 0) || 0,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Top Bar (Internal to page) */}
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900">Retailer Dashboard</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Manage your pharmacy procurement and logistics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="relative h-12 w-12 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <Bell className="h-5 w-5 text-slate-600" />
                        <span className="absolute top-3 right-3 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white" />
                    </Button>
                    <Link href="/checkout">
                        <Button variant="outline" className="h-12 border-slate-200 font-black rounded-xl px-6 gap-2 bg-white shadow-sm hover:shadow-md transition-all">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                            Secure Checkout
                            {cartItems.length > 0 && (
                                <Badge className="h-6 w-6 p-0 flex items-center justify-center text-[10px] bg-primary border-none font-black">
                                    {cartItems.length}
                                </Badge>
                            )}
                        </Button>
                    </Link>
                </div>
            </header>
            {/* Quick Search Hero */}
            <Card className="border-none bg-gradient-to-r from-primary to-secondary text-white overflow-hidden relative shadow-lg shadow-primary/20 rounded-3xl">
                <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
                    <Search className="h-full w-full" />
                </div>
                <CardContent className="p-8 relative z-10">
                    <h2 className="text-2xl font-black mb-2">Search & Order Medicines</h2>
                    <p className="text-white/70 text-sm mb-4">500,000+ SKUs from 3,000+ distributors across Kerala</p>
                    <div className="flex gap-3 max-w-lg">
                        <Input
                            placeholder="Search medicine, generic name..."
                            className="bg-white/20 border-white/20 text-white placeholder:text-white/60 h-12 text-base"
                            value={quickSearch}
                            onChange={(e) => setQuickSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && router.push(`/search?q=${quickSearch}`)}
                        />
                        <Button variant="secondary" className="h-12 px-6 font-bold"
                            onClick={() => router.push(`/search?q=${quickSearch}`)}>
                            <Search className="h-4 w-4 mr-2" /> Search
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Orders", value: stats.totalOrders, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Pending", value: stats.pending, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
                    { label: "Delivered", value: stats.delivered, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Total Spend", value: `₹${(stats.totalSpend / 1000).toFixed(1)}k`, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <Card key={label} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                                <Icon className={`h-6 w-6 ${color}`} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                                <p className="text-2xl font-black text-slate-900">{value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Orders */}
            <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>Track your latest orders in real-time</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <RefreshCcw className="h-3.5 w-3.5" /> Refresh
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading && (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    )}

                    {orders?.slice(0, 5).map((order: any) => {
                        const currentStep = STATUS_STEPS.indexOf(order.status);
                        return (
                            <div key={order.id} className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                                        <p className="text-xs text-muted-foreground">{order.distributor?.companyName} • {order.items?.length} items</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-primary">₹{order.totalAmount.toFixed(0)}</p>
                                        <Badge className={`text-[10px] mt-1 border ${ORDER_STATUS_COLOR[order.status] || ''}`} variant="outline">
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                                {/* Progress Timeline */}
                                <div className="flex items-center gap-0">
                                    {STATUS_STEPS.map((s, i) => (
                                        <div key={s} className="flex items-center flex-1 last:flex-none">
                                            <div className={`h-2 w-2 rounded-full shrink-0 ${i <= currentStep ? "bg-primary" : "bg-slate-200"}`} />
                                            {i < STATUS_STEPS.length - 1 && (
                                                <div className={`h-0.5 flex-1 ${i < currentStep ? "bg-primary" : "bg-slate-200"}`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-1">
                                    {STATUS_STEPS.map((s, i) => (
                                        <span key={s} className={`text-[9px] font-medium ${i <= currentStep ? "text-primary" : "text-slate-300"}`}>
                                            {s.charAt(0) + s.slice(1).toLowerCase()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {!isLoading && (!orders || orders.length === 0) && (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium">No orders yet</p>
                            <Button className="mt-4" onClick={() => router.push('/search')}>
                                <Search className="h-4 w-4 mr-2" /> Browse Medicines
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
