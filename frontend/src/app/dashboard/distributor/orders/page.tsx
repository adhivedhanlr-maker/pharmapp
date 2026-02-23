'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function OrdersPage() {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900">Order Management</h1>
                    <p className="text-slate-500 font-medium">Process and track incoming retailer requests.</p>
                </div>
                <Button className="bg-primary text-white font-black rounded-xl h-12 px-6 shadow-lg shadow-primary/20">
                    <Plus className="h-5 w-5 mr-2" /> Manual Order
                </Button>
            </div>

            <Card className="border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-black text-slate-800">Active Requests</CardTitle>
                        <CardDescription className="text-slate-500">Orders requiring your verification</CardDescription>
                    </div>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search orders..." className="pl-10 h-10 rounded-xl bg-white border-slate-200" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-12 text-center">
                        <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Search className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">No Orders Found</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 font-medium">There are currently no active order requests matching your territory.</p>
                        <Button variant="outline" className="mt-6 border-slate-200 font-bold rounded-xl h-11">
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
