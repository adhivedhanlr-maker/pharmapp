'use client';

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Search } from "lucide-react";

function downloadCsv(rows: any[]) {
    const header = ["Invoice No", "Date", "Retailer", "Amount", "GST", "Status"];
    const data = rows.map((order) => [
        order.id,
        new Date(order.createdAt).toISOString(),
        order.retailer?.shopName || "",
        order.totalAmount,
        order.gstAmount,
        order.status,
    ]);
    const csv = [header, ...data].map((line) => line.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function InvoicesPage() {
    const [query, setQuery] = useState("");

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["distributor-orders-invoices"],
        queryFn: async () => {
            const res = await api.get("/orders/distributor");
            return res.data;
        },
    });

    const invoices = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return orders
            .filter((o: any) => ["DELIVERED", "SHIPPED", "ACCEPTED"].includes(o.status))
            .filter((o: any) => {
                if (!needle) return true;
                return [o.id, o.retailer?.shopName, o.retailer?.district].filter(Boolean).join(" ").toLowerCase().includes(needle);
            });
    }, [orders, query]);

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900">Invoices</h1>
                    <p className="text-slate-500 font-medium">Operational invoice exports generated from processed orders.</p>
                </div>
                <Button variant="outline" className="border-slate-200 font-bold rounded-xl h-12 px-6" onClick={() => downloadCsv(invoices)}>
                    <Download className="h-4 w-4 mr-2" /> Export CSV
                </Button>
            </div>

            <Card className="border-slate-100 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-black text-slate-800">Generated Documents</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">{invoices.length} invoice rows</CardDescription>
                    </div>
                    <div className="relative w-72 max-w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search invoice by ID or retailer"
                            className="pl-10 h-10 rounded-xl bg-white border-slate-200"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-10 text-center text-slate-500">Loading invoices...</div>
                    ) : invoices.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">No invoice-eligible orders yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50/60 border-b">
                                    <tr>
                                        <th className="text-left p-3 font-bold">Invoice ID</th>
                                        <th className="text-left p-3 font-bold">Retailer</th>
                                        <th className="text-left p-3 font-bold">Date</th>
                                        <th className="text-left p-3 font-bold">Amount</th>
                                        <th className="text-left p-3 font-bold">GST</th>
                                        <th className="text-left p-3 font-bold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((order: any) => (
                                        <tr key={order.id} className="border-b">
                                            <td className="p-3 font-semibold">{order.id.slice(-10).toUpperCase()}</td>
                                            <td className="p-3">{order.retailer?.shopName || "-"}</td>
                                            <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="p-3">Rs {order.totalAmount.toFixed(2)}</td>
                                            <td className="p-3">Rs {order.gstAmount.toFixed(2)}</td>
                                            <td className="p-3"><Badge variant="outline">{order.status}</Badge></td>
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
