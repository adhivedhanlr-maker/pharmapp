'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    Users,
    ShoppingCart,
    Activity,
    Map as MapIcon,
    Search,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";

const districtData = [
    { name: 'Ernakulam', value: 85, revenue: 1200000 },
    { name: 'Kozhikode', value: 65, revenue: 850000 },
    { name: 'Trivandrum', value: 72, revenue: 950000 },
    { name: 'Thrissur', value: 58, revenue: 620000 },
    { name: 'Kannur', value: 45, revenue: 410000 },
];

const revenueTrend = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
];

export default function AdminEnterpriseDashboard() {
    return (
        <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Market Intelligence</h1>
                    <p className="text-muted-foreground mt-1">Real-time overview of the Kerala Pharma Network.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Last 30 Days</Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">Download Report</Button>
                </div>
            </div>

            {/* Hero Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-600 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">GMV (MTD)</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">₹ 8.42 Cr</div>
                        <div className="flex items-center text-xs text-green-600 font-bold mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" /> +18.2%
                            <span className="text-muted-foreground font-normal ml-1">vs last month</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-secondary shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Active Retailers</CardTitle>
                        <Users className="h-4 w-4 text-secondary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">12,482</div>
                        <div className="flex items-center text-xs text-green-600 font-bold mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" /> +2.4%
                            <span className="text-muted-foreground font-normal ml-1">new signups</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Search Volume</CardTitle>
                        <Search className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">3.2M</div>
                        <div className="flex items-center text-xs text-red-600 font-bold mt-1">
                            <ArrowDownRight className="h-3 w-3 mr-1" /> -4.1%
                            <span className="text-muted-foreground font-normal ml-1">weekend dip</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">99.98%</div>
                        <div className="flex items-center text-xs text-green-600 font-bold mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" /> Stable
                            <span className="text-muted-foreground font-normal ml-1">3 nodes active</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Heatmap Section */}
                <Card className="lg:col-span-4 overflow-hidden border-none shadow-xl">
                    <CardHeader className="bg-white border-b">
                        <CardTitle className="flex items-center gap-2">
                            <MapIcon className="h-5 w-5 text-primary" /> Kerala Order Heatmap
                        </CardTitle>
                        <CardDescription>Order density by district for May 2024</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col md:flex-row h-[400px]">
                        <div className="flex-1 bg-slate-900 flex items-center justify-center relative group">
                            {/* Mock Kerala Map SVG */}
                            <svg viewBox="0 0 100 200" className="h-[90%] w-auto opacity-80 group-hover:opacity-100 transition-opacity">
                                <path d="M40 10 L50 20 L45 40 L60 60 L55 90 L70 120 L60 150 L50 180 L30 170 L20 140 L15 110 L25 80 L20 50 L35 20 Z" fill="#1E40AF" className="transition-colors hover:fill-secondary" />
                                <circle cx="50" cy="50" r="4" fill="#60A5FA" className="animate-pulse" />
                                <circle cx="60" cy="120" r="3" fill="#60A5FA" />
                                <circle cx="45" cy="160" r="5" fill="#60A5FA" className="animate-pulse" />
                            </svg>
                            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded text-[10px] text-white space-y-1">
                                <div className="flex items-center gap-2"><div className="h-2 w-2 bg-blue-600 rounded-full" /> High Density</div>
                                <div className="flex items-center gap-2"><div className="h-2 w-2 bg-blue-300 rounded-full" /> Medium Density</div>
                            </div>
                        </div>
                        <div className="w-full md:w-64 bg-white p-6 space-y-4 overflow-y-auto">
                            {districtData.map(d => (
                                <div key={d.name} className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>{d.name}</span>
                                        <span>{d.value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${d.value}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Chart */}
                <Card className="lg:col-span-3 border-none shadow-xl">
                    <CardHeader>
                        <CardTitle>Revenue Forecast</CardTitle>
                        <CardDescription>Projected vs Actual (Lacs)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueTrend}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
