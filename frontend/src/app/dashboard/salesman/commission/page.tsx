'use client';

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const COMMISSION_RATE = 0.02;

export default function SalesmanCommissionPage() {
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["salesman-orders-commission"],
        queryFn: async () => {
            const res = await api.get("/orders/salesman");
            return res.data;
        },
    });

    const metrics = useMemo(() => {
        const delivered = orders.filter((o: any) => o.status === "DELIVERED");
        const totalDelivered = delivered.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
        const estimate = totalDelivered * COMMISSION_RATE;
        return { delivered, totalDelivered, estimate };
    }, [orders]);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900">Commission</h1>
                <p className="text-slate-500 font-medium">Estimated commission based on delivered assigned orders.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle className="text-sm">Delivered Orders</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-black">{metrics.delivered.length}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm">Delivered Value</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-black">Rs {metrics.totalDelivered.toFixed(2)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm">Estimated Commission</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-black">Rs {metrics.estimate.toFixed(2)}</p></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Commission Ledger</CardTitle>
                    <CardDescription>Rate used: {(COMMISSION_RATE * 100).toFixed(1)}% of delivered order value.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {isLoading ? <p className="text-sm text-slate-500">Loading...</p> : metrics.delivered.length === 0 ? (
                        <p className="text-sm text-slate-500">No delivered assigned orders yet.</p>
                    ) : metrics.delivered.map((order: any) => {
                        const commission = order.totalAmount * COMMISSION_RATE;
                        return (
                            <div key={order.id} className="flex items-center justify-between border rounded-lg p-3">
                                <div>
                                    <p className="font-semibold">#{order.id.slice(-8).toUpperCase()}</p>
                                    <p className="text-xs text-slate-500">{order.retailer?.shopName || "Retailer"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">Rs {commission.toFixed(2)}</p>
                                    <Badge variant="outline">DELIVERED</Badge>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
