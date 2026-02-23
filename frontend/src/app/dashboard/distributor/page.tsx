'use client';

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Package,
    ShoppingCart,
    TrendingUp,
    AlertTriangle
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from "recharts";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DistributorDashboard() {
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["distributor-orders-dashboard"],
        queryFn: async () => {
            const res = await api.get("/orders/distributor");
            return res.data;
        },
    });

    const stats = useMemo(() => {
        const now = new Date();
        const today = now.toDateString();
        const todayOrders = orders.filter((o: any) => new Date(o.createdAt).toDateString() === today);
        const pending = orders.filter((o: any) => o.status === "PENDING");
        const revenue = orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
        const lowConfidence = orders.filter((o: any) => ["PENDING", "ACCEPTED"].includes(o.status)).length;
        return {
            todayOrders: todayOrders.length,
            pending: pending.length,
            revenue,
            lowConfidence,
        };
    }, [orders]);

    const weekly = useMemo(() => {
        const map = new Map<string, { day: string; orders: number; revenue: number }>();
        for (const day of DAYS) {
            map.set(day, { day, orders: 0, revenue: 0 });
        }
        for (const order of orders) {
            const day = DAYS[new Date(order.createdAt).getDay()];
            const row = map.get(day)!;
            row.orders += 1;
            row.revenue += order.totalAmount;
        }
        return DAYS.map((d) => map.get(d)!);
    }, [orders]);

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900">Distributor Dashboard</h1>
                <p className="text-slate-500 font-medium">Operational summary from your live order stream.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Today&apos;s Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-slate-900">{stats.todayOrders}</div></CardContent>
                </Card>
                <Card className="border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Pending Orders</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-slate-900">{stats.pending}</div></CardContent>
                </Card>
                <Card className="border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-slate-900">Rs {stats.revenue.toFixed(2)}</div></CardContent>
                </Card>
                <Card className="border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Actionable</CardTitle>
                        <Package className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-slate-900">{stats.lowConfidence}</div></CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-slate-100">
                    <CardHeader>
                        <CardTitle className="font-black text-slate-900">Weekly Revenue</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">By order date</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {isLoading ? <p className="text-sm text-slate-500">Loading chart...</p> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weekly}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip />
                                    <Bar dataKey="revenue" fill="#1e40af" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3 border-slate-100">
                    <CardHeader>
                        <CardTitle className="font-black text-slate-900">Order Trend</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Order count per weekday</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {isLoading ? <p className="text-sm text-slate-500">Loading chart...</p> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weekly}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="orders" stroke="#0d9488" strokeWidth={3} dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
