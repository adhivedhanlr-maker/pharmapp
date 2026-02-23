'use client';

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";

const STATUS_ORDER = ["PENDING", "ACCEPTED", "SHIPPED", "DELIVERED", "CANCELLED", "REJECTED"];
const STATUS_STYLE: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    ACCEPTED: "bg-blue-100 text-blue-700 border-blue-200",
    SHIPPED: "bg-indigo-100 text-indigo-700 border-indigo-200",
    DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
    REJECTED: "bg-slate-200 text-slate-700 border-slate-300",
};

export default function OrdersPage() {
    const queryClient = useQueryClient();
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["distributor-orders"],
        queryFn: async () => {
            const res = await api.get("/orders/distributor");
            return res.data;
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await api.patch(`/orders/${id}/status`, { status });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Order status updated");
            queryClient.invalidateQueries({ queryKey: ["distributor-orders"] });
        },
        onError: () => toast.error("Failed to update order status"),
    });

    const filtered = useMemo(() => {
        return orders.filter((order: any) => {
            const matchStatus = statusFilter === "ALL" || order.status === statusFilter;
            const needle = query.trim().toLowerCase();
            if (!needle) return matchStatus;
            const matchText = [
                order.id,
                order.retailer?.shopName,
                order.retailer?.district,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(needle);
            return matchStatus && matchText;
        });
    }, [orders, query, statusFilter]);

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900">Order Management</h1>
                    <p className="text-slate-500 font-medium">Review retailer requests and progress each shipment.</p>
                </div>
                <div className="flex items-center gap-2">
                    {STATUS_ORDER.map((status) => (
                        <Button
                            key={status}
                            size="sm"
                            variant={statusFilter === status ? "default" : "outline"}
                            className="h-8"
                            onClick={() => setStatusFilter(status)}
                        >
                            {status}
                        </Button>
                    ))}
                    <Button size="sm" variant={statusFilter === "ALL" ? "default" : "outline"} className="h-8" onClick={() => setStatusFilter("ALL")}>ALL</Button>
                </div>
            </div>

            <Card className="border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-black text-slate-800">Incoming Orders</CardTitle>
                        <CardDescription className="text-slate-500">Live feed from retailer purchases</CardDescription>
                    </div>
                    <div className="relative w-72 max-w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by order ID or retailer"
                            className="pl-10 h-10 rounded-xl bg-white border-slate-200"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-10 text-center text-slate-500">Loading orders...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">No orders found for the selected filters.</div>
                    ) : (
                        <div className="divide-y">
                            {filtered.map((order: any) => (
                                <div key={order.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <p className="font-black text-slate-900">#{order.id.slice(-8).toUpperCase()}</p>
                                        <p className="text-sm text-slate-600">{order.retailer?.shopName || "Unknown Retailer"} • {order.retailer?.district || "-"}</p>
                                        <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                                        <p className="text-xs text-slate-500 mt-1">Items: {order.items?.length || 0}</p>
                                    </div>
                                    <div className="flex flex-col md:items-end gap-2">
                                        <p className="font-black text-primary text-lg">Rs {order.totalAmount.toFixed(2)}</p>
                                        <Badge variant="outline" className={`border ${STATUS_STYLE[order.status] || ""}`}>{order.status}</Badge>
                                        <div className="flex flex-wrap gap-2">
                                            {["ACCEPTED", "SHIPPED", "DELIVERED", "CANCELLED"].map((next) => (
                                                <Button
                                                    key={next}
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8"
                                                    disabled={order.status === next || updateMutation.isPending}
                                                    onClick={() => updateMutation.mutate({ id: order.id, status: next })}
                                                >
                                                    {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : next}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
