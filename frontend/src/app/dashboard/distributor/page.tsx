'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    TrendingUp,
    AlertTriangle,
    FileText,
    Settings
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

const data = [
    { name: 'Mon', orders: 45, revenue: 45000 },
    { name: 'Tue', orders: 52, revenue: 52000 },
    { name: 'Wed', orders: 38, revenue: 38000 },
    { name: 'Thu', orders: 65, revenue: 65000 },
    { name: 'Fri', orders: 48, revenue: 48000 },
    { name: 'Sat', orders: 30, revenue: 30000 },
    { name: 'Sun', orders: 20, revenue: 20000 },
];

export default function DistributorDashboard() {
    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900">Distributor Dashboard</h1>
                    <p className="text-slate-500 font-medium">Welcome back, Kerala Medicos Ltd.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="border-slate-200 font-bold">Subscription: Pro Plan</Button>
                    <Button className="bg-primary text-white font-bold shadow-lg shadow-primary/20">Upload New Stock (Excel)</Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="hover:shadow-md transition-shadow border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Today's Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">42</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-1 font-bold">
                            <TrendingUp className="h-3 w-3 mr-1" /> +12% from yesterday
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Pending Orders</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">15</div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Requires immediate action</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Revenue (MTD)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">₹ 8.42L</div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">On track for ₹ 12L target</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Low Stock Alerts</CardTitle>
                        <Package className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">8</div>
                        <p className="text-xs text-rose-600 mt-1 font-bold">Critical items below margin</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-slate-100">
                    <CardHeader>
                        <CardTitle className="font-black text-slate-900">Sales Revenue Weekly</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Performance comparison for last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="revenue" fill="#1e40af" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3 border-slate-100">
                    <CardHeader>
                        <CardTitle className="font-black text-slate-900">Order Trends</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Volume of orders per day</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="orders" stroke="#0d9488" strokeWidth={3} dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
