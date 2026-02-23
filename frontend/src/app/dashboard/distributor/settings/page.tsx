'use client';

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const SETTINGS_KEY = "distributor-ui-settings";

type UiSettings = {
    notificationEmail: string;
    autoAcceptOrders: boolean;
    lowStockThreshold: number;
};

const defaults: UiSettings = {
    notificationEmail: "",
    autoAcceptOrders: false,
    lowStockThreshold: 20,
};

export default function SettingsPage() {
    const { data: me } = useQuery({
        queryKey: ["auth-me"],
        queryFn: async () => {
            const res = await api.get("/auth/me");
            return res.data;
        },
    });

    const [settings, setSettings] = useState<UiSettings>(defaults);

    useEffect(() => {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
            try {
                setSettings({ ...defaults, ...JSON.parse(raw) });
                return;
            } catch {}
        }
        setSettings((s) => ({ ...s, notificationEmail: me?.email || "" }));
    }, [me?.email]);

    const companyName = useMemo(() => me?.name || "Distributor", [me?.name]);

    const save = () => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        toast.success("Settings saved locally");
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900">Settings</h1>
                <p className="text-slate-500 font-medium">Operational configuration for {companyName}.</p>
            </div>

            <Card className="border-slate-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="font-black text-slate-900">Notification & Automation</CardTitle>
                    <CardDescription className="text-slate-500">These settings are saved on this browser until profile APIs are added.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="notificationEmail">Alert Email</Label>
                        <Input
                            id="notificationEmail"
                            value={settings.notificationEmail}
                            onChange={(e) => setSettings((s) => ({ ...s, notificationEmail: e.target.value }))}
                            placeholder="ops@yourdistributor.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                        <Input
                            id="lowStockThreshold"
                            type="number"
                            min={1}
                            value={settings.lowStockThreshold}
                            onChange={(e) => setSettings((s) => ({ ...s, lowStockThreshold: Number(e.target.value || 1) }))}
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <p className="font-semibold">Auto-accept new orders</p>
                            <p className="text-sm text-slate-500">When enabled, incoming orders are marked as ACCEPTED automatically.</p>
                        </div>
                        <Switch
                            checked={settings.autoAcceptOrders}
                            onCheckedChange={(checked) => setSettings((s) => ({ ...s, autoAcceptOrders: checked }))}
                        />
                    </div>

                    <Button className="h-11 px-8 font-bold" onClick={save}>Save Settings</Button>
                </CardContent>
            </Card>
        </div>
    );
}
