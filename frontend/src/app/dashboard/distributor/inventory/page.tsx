'use client';

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package } from "lucide-react";

export default function InventoryPage() {
    const [query, setQuery] = useState("");

    const { data: me } = useQuery({
        queryKey: ["auth-me"],
        queryFn: async () => {
            const res = await api.get("/auth/me");
            return res.data;
        },
    });

    const distributorId = me?.distributor?.id;

    const { data: inventory = [], isLoading } = useQuery({
        queryKey: ["distributor-inventory", distributorId],
        queryFn: async () => {
            const res = await api.get(`/inventory/distributor/${distributorId}`);
            return res.data;
        },
        enabled: Boolean(distributorId),
    });

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return inventory;
        return inventory.filter((item: any) =>
            [item.product?.name, item.product?.genericName, item.batchNumber]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(needle)
        );
    }, [inventory, query]);

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900">Inventory</h1>
                <p className="text-slate-500 font-medium">Live stock visibility for your distributor catalog.</p>
            </div>

            <Card className="border-slate-100 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-black text-slate-800">Stock Ledger</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">{filtered.length} rows</CardDescription>
                    </div>
                    <div className="relative w-72 max-w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search medicines, generic, batch..."
                            className="pl-10 h-10 rounded-xl bg-white border-slate-200"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-10 text-center text-slate-500">Loading inventory...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">No inventory items found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50/60 border-b">
                                    <tr>
                                        <th className="text-left p-3 font-bold">Product</th>
                                        <th className="text-left p-3 font-bold">Generic</th>
                                        <th className="text-left p-3 font-bold">Batch</th>
                                        <th className="text-left p-3 font-bold">PTR</th>
                                        <th className="text-left p-3 font-bold">MRP</th>
                                        <th className="text-left p-3 font-bold">Stock</th>
                                        <th className="text-left p-3 font-bold">Expiry</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((item: any) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="p-3 font-semibold text-slate-900">{item.product?.name}</td>
                                            <td className="p-3 text-slate-600">{item.product?.genericName}</td>
                                            <td className="p-3 text-slate-600">{item.batchNumber || "-"}</td>
                                            <td className="p-3">Rs {item.ptr?.toFixed(2)}</td>
                                            <td className="p-3">Rs {item.mrp?.toFixed(2)}</td>
                                            <td className="p-3">
                                                <Badge variant={item.stock > 20 ? "default" : "destructive"}>{item.stock}</Badge>
                                            </td>
                                            <td className="p-3 text-slate-600">{new Date(item.expiry).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {!distributorId && (
                <Card className="border-dashed">
                    <CardContent className="p-6 text-sm text-slate-600 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Distributor profile missing on this account. Please re-login or contact admin.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
