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

    const { data: opportunities = [] } = useQuery({
        queryKey: ["distributor-opportunities"],
        queryFn: async () => {
            const res = await api.get("/intelligence/distributor/opportunities");
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

            <Card className="border-slate-100">
                <CardHeader>
                    <CardTitle className="font-black text-slate-900">Pharmacy Opportunities</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">
                        Pharmacies with low stock or near-expiry where your inventory is a strong match.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {opportunities.length === 0 ? (
                        <div className="p-6 text-sm text-slate-500">No opportunities yet. Add/refresh your stock to get matched.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50/60 border-b">
                                    <tr>
                                        <th className="p-3 text-left font-semibold">Product</th>
                                        <th className="p-3 text-left font-semibold">Pharmacy</th>
                                        <th className="p-3 text-left font-semibold">Demand Qty</th>
                                        <th className="p-3 text-left font-semibold">Your Stock</th>
                                        <th className="p-3 text-left font-semibold">Phone</th>
                                        <th className="p-3 text-left font-semibold">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {opportunities.slice(0, 15).map((item: any) => (
                                        <tr key={item.matchId} className="border-b">
                                            <td className="p-3 font-medium text-slate-900">{item.product}</td>
                                            <td className="p-3">{item.pharmacy?.name} ({item.pharmacy?.district})</td>
                                            <td className="p-3">{item.demand?.currentQty}</td>
                                            <td className="p-3">{item.yourOffer?.availableStock}</td>
                                            <td className="p-3">{item.pharmacy?.phone || '-'}</td>
                                            <td className="p-3 font-semibold text-primary">{item.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
