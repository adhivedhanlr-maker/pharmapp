'use client';

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SalesmanRetailersPage() {
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["salesman-orders-retailers"],
        queryFn: async () => {
            const res = await api.get("/orders/salesman");
            return res.data;
        },
    });

    const retailers = useMemo(() => {
        const map = new Map<string, any>();
        for (const order of orders) {
            if (!order.retailer?.id) continue;
            const existing = map.get(order.retailer.id) || {
                id: order.retailer.id,
                shopName: order.retailer.shopName,
                district: order.retailer.district,
                orders: 0,
                value: 0,
                lastOrderAt: order.createdAt,
            };
            existing.orders += 1;
            existing.value += order.totalAmount;
            if (new Date(order.createdAt) > new Date(existing.lastOrderAt)) {
                existing.lastOrderAt = order.createdAt;
            }
            map.set(order.retailer.id, existing);
        }
        return Array.from(map.values()).sort((a, b) => b.value - a.value);
    }, [orders]);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900">My Retailers</h1>
                <p className="text-slate-500 font-medium">Retailers assigned through your current order book.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Retailer Portfolio</CardTitle>
                    <CardDescription>{retailers.length} accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoading ? <p className="text-sm text-slate-500">Loading...</p> : retailers.length === 0 ? (
                        <p className="text-sm text-slate-500">No assigned retailer orders yet.</p>
                    ) : retailers.map((r) => (
                        <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <p className="font-semibold">{r.shopName}</p>
                                <p className="text-xs text-slate-500">{r.district}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">Rs {r.value.toFixed(2)}</p>
                                <div className="flex justify-end gap-2 mt-1">
                                    <Badge variant="outline">{r.orders} orders</Badge>
                                    <Badge variant="outline">Last: {new Date(r.lastOrderAt).toLocaleDateString()}</Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
