'use client';

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    ACCEPTED: "bg-blue-100 text-blue-700 border-blue-200",
    SHIPPED: "bg-indigo-100 text-indigo-700 border-indigo-200",
    DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function RetailerOrdersPage() {
    const [query, setQuery] = useState("");

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["retailer-orders-full"],
        queryFn: async () => {
            const res = await api.get("/orders/retailer");
            return res.data;
        },
    });

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return orders;
        return orders.filter((o: any) =>
            [o.id, o.distributor?.companyName, o.status].filter(Boolean).join(" ").toLowerCase().includes(needle)
        );
    }, [orders, query]);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900">My Orders</h1>
                <p className="text-slate-500 font-medium">Track all orders and delivery progress.</p>
            </div>

            <Card className="border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Order History</CardTitle>
                        <CardDescription>{filtered.length} records</CardDescription>
                    </div>
                    <div className="relative w-72 max-w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by ID, distributor, status" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-10 text-center text-slate-500">Loading orders...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">No orders found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50/60 border-b">
                                    <tr>
                                        <th className="p-3 text-left font-bold">Order</th>
                                        <th className="p-3 text-left font-bold">Distributor</th>
                                        <th className="p-3 text-left font-bold">Date</th>
                                        <th className="p-3 text-left font-bold">Items</th>
                                        <th className="p-3 text-left font-bold">Amount</th>
                                        <th className="p-3 text-left font-bold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((order: any) => (
                                        <tr key={order.id} className="border-b">
                                            <td className="p-3 font-semibold">#{order.id.slice(-8).toUpperCase()}</td>
                                            <td className="p-3">{order.distributor?.companyName || "-"}</td>
                                            <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="p-3">{order.items?.length || 0}</td>
                                            <td className="p-3">Rs {order.totalAmount.toFixed(2)}</td>
                                            <td className="p-3"><Badge variant="outline" className={`border ${STATUS_STYLE[order.status] || ""}`}>{order.status}</Badge></td>
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
