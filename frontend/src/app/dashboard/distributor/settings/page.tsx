'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Shield, Bell, Lock, Globe } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900">Organization Settings</h1>
                <p className="text-slate-500 font-medium">Configure your workspace and security protocols.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                    { icon: Shield, title: "Identity Vault", desc: "Authentication & Security" },
                    { icon: Bell, title: "Signal Matrix", desc: "Notification Protocols" },
                    { icon: Globe, title: "Regional Logic", desc: "Locale & Tax Jurisdiction" },
                    { icon: Lock, title: "Data Governance", desc: "Encryption & API Access" },
                ].map((s) => (
                    <Card key={s.title} className="hover:border-primary/50 transition-colors cursor-pointer border-slate-100 shadow-sm">
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <s.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-black text-slate-900">{s.title}</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.desc}</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <Card className="border-slate-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="font-black text-slate-900">Profile Architecture</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Update your public nodes and business credentials.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="bg-primary text-white font-black rounded-xl h-11 px-8 shadow-lg shadow-primary/20">
                        Save Configuration
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
