'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SalesmenPage() {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900">Sales Network</h1>
                    <p className="text-slate-500 font-medium">Coordinate your field agents and team performance.</p>
                </div>
                <Button className="bg-primary text-white font-black rounded-xl h-12 px-6 shadow-lg shadow-primary/20">
                    <UserPlus className="h-5 w-5 mr-2" /> Add Salesman
                </Button>
            </div>

            <Card className="border-slate-100 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-black text-slate-800">Field Operations</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Real-time GPS tracking enabled</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-12 text-center">
                    <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Users className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Team is Offline</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 font-medium">Invite your sales agents to the platform to begin tracking.</p>
                </CardContent>
            </Card>
        </div>
    );
}
