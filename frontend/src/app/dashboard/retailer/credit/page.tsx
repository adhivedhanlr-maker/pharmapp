'use client';

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const UNPAID_STATUSES = new Set(["PENDING", "ACCEPTED", "SHIPPED"]);

export default function RetailerCreditPage() {
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["retailer-orders-credit"],
        queryFn: async () => {
            const res = await api.get("/orders/retailer");
            return res.data;
        },
    });

    const summary = useMemo(() => {
        const outstanding = orders
            .filter((o: any) => UNPAID_STATUSES.has(o.status))
            .reduce((sum: number, o: any) => sum + o.totalAmount, 0);
        const paid = orders
            .filter((o: any) => o.status === "DELIVERED")
            .reduce((sum: number, o: any) => sum + o.totalAmount, 0);
        const heuristicLimit = Math.max(outstanding + paid, 1);
        const utilization = Math.min(100, Math.round((outstanding / heuristicLimit) * 100));
        return { outstanding, paid, heuristicLimit, utilization };
    }, [orders]);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900">Credit & Payments</h1>
                <p className="text-slate-500 font-medium">Monitor outstanding dues and payment progression.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Outstanding</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black">Rs {summary.outstanding.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Settled Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black">Rs {summary.paid.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Order Count</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black">{orders.length}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Credit Utilization</CardTitle>
                    <CardDescription>Estimated from current order lifecycle.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${summary.utilization}%` }} />
                    </div>
                    <p className="text-sm text-slate-600">{summary.utilization}% utilized</p>
                    <p className="text-xs text-slate-500">This view uses available order data. Backend credit ledger endpoints can be connected for precise balances.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Payment-Relevant Orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {isLoading ? <p className="text-sm text-slate-500">Loading...</p> : orders.slice(0, 8).map((o: any) => (
                        <div key={o.id} className="flex items-center justify-between border rounded-lg p-3">
                            <div>
                                <p className="font-semibold">#{o.id.slice(-8).toUpperCase()}</p>
                                <p className="text-xs text-slate-500">{o.distributor?.companyName || "Distributor"}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">Rs {o.totalAmount.toFixed(2)}</p>
                                <Badge variant="outline">{o.status}</Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
