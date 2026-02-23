'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Search, Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function InventoryPage() {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900">Neural Inventory</h1>
                    <p className="text-slate-500 font-medium">Manage your warehouse stock and forecasting.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-200 font-bold rounded-xl h-12 px-6">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                    </Button>
                    <Button className="bg-primary text-white font-black rounded-xl h-12 px-6 shadow-lg shadow-primary/20">
                        <Plus className="h-5 w-5 mr-2" /> Add Item
                    </Button>
                </div>
            </div>

            <Card className="border-slate-100 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-black text-slate-800">Master Catalog</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">8,420 SKUs currently in system</CardDescription>
                    </div>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search medicines..." className="pl-10 h-10 rounded-xl bg-white border-slate-200" />
                    </div>
                </CardHeader>
                <CardContent className="p-12 text-center">
                    <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Package className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Loading Inventory...</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 font-medium">Syncing with warehouse management node.</p>
                </CardContent>
            </Card>
        </div>
    );
}
