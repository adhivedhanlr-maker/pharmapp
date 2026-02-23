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
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden lg:flex flex-col">
                <div className="p-6">
                    <span className="text-2xl font-bold text-primary">Pharma<span className="text-secondary">App</span></span>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-primary bg-primary/5">
                        <LayoutDashboard className="h-5 w-5 mr-3" /> Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <ShoppingCart className="h-5 w-5 mr-3" /> Orders
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <Package className="h-5 w-5 mr-3" /> Inventory
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <Users className="h-5 w-5 mr-3" /> Salesmen
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <FileText className="h-5 w-5 mr-3" /> Invoices
                    </Button>
                </nav>
                <div className="p-4 border-t">
                    <Button variant="ghost" className="w-full justify-start">
                        <Settings className="h-5 w-5 mr-3" /> Settings
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Distributor Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, Kerala Medicos Ltd.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline">Subscription: Pro Plan</Button>
                        <Button className="bg-primary text-white">Upload New Stock (Excel)</Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">42</div>
                            <p className="text-xs text-green-600 flex items-center mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" /> +12% from yesterday
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">15</div>
                            <p className="text-xs text-muted-foreground mt-1">Requires immediate action</p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Revenue (MTD)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹ 8.42L</div>
                            <p className="text-xs text-muted-foreground mt-1">On track for ₹ 12L target</p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                            <Package className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">8</div>
                            <p className="text-xs text-red-600 mt-1">Critical items below margin</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Sales Revenue Weekly</CardTitle>
                            <CardDescription>Performance comparison for last 7 days</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Order Trends</CardTitle>
                            <CardDescription>Volume of orders per day</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="orders" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
