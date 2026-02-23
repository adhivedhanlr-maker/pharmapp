'use client';

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

export default function SalesmanRoutePage() {
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["salesman-orders-route"],
        queryFn: async () => {
            const res = await api.get("/orders/salesman");
            return res.data;
        },
    });

    const stops = useMemo(() => {
        const byRetailer = new Map<string, any>();
        for (const order of orders) {
            if (!order.retailer?.id) continue;
            const key = order.retailer.id;
            const current = byRetailer.get(key) || {
                id: key,
                shopName: order.retailer.shopName,
                district: order.retailer.district,
                pending: 0,
                lastOrderAt: order.createdAt,
            };
            if (["PENDING", "ACCEPTED", "SHIPPED"].includes(order.status)) current.pending += 1;
            if (new Date(order.createdAt) > new Date(current.lastOrderAt)) current.lastOrderAt = order.createdAt;
            byRetailer.set(key, current);
        }
        return Array.from(byRetailer.values())
            .sort((a, b) => b.pending - a.pending || a.district.localeCompare(b.district));
    }, [orders]);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900">Route Plan</h1>
                <p className="text-slate-500 font-medium">Prioritized visit plan from active assigned orders.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Today&apos;s Suggested Stops</CardTitle>
                    <CardDescription>Sorted by pending load first.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoading ? <p className="text-sm text-slate-500">Loading route...</p> : stops.length === 0 ? (
                        <p className="text-sm text-slate-500">No active route stops yet.</p>
                    ) : stops.map((s, index) => (
                        <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">{index + 1}</div>
                                <div>
                                    <p className="font-semibold">{s.shopName}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.district}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant="outline">{s.pending} pending</Badge>
                                <p className="text-xs text-slate-500 mt-1">Last order: {new Date(s.lastOrderAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
