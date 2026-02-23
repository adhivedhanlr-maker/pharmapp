'use client';

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function SalesmanOrdersPage() {
    const [query, setQuery] = useState("");

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["salesman-orders"],
        queryFn: async () => {
            const res = await api.get("/orders/salesman");
            return res.data;
        },
    });

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return orders;
        return orders.filter((o: any) =>
            [o.id, o.retailer?.shopName, o.distributor?.companyName, o.status].filter(Boolean).join(" ").toLowerCase().includes(needle)
        );
    }, [orders, query]);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900">Assigned Orders</h1>
                <p className="text-slate-500 font-medium">Order pipeline assigned to your salesman account.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Orders</CardTitle>
                        <CardDescription>{filtered.length} records</CardDescription>
                    </div>
                    <div className="relative w-72 max-w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search orders" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {isLoading ? <p className="text-sm text-slate-500">Loading...</p> : filtered.length === 0 ? (
                        <p className="text-sm text-slate-500">No assigned orders found.</p>
                    ) : filtered.map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between border rounded-lg p-3">
                            <div>
                                <p className="font-semibold">#{order.id.slice(-8).toUpperCase()}</p>
                                <p className="text-xs text-slate-500">{order.retailer?.shopName || "Retailer"} • {order.distributor?.companyName || "Distributor"}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">Rs {order.totalAmount.toFixed(2)}</p>
                                <Badge variant="outline">{order.status}</Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
