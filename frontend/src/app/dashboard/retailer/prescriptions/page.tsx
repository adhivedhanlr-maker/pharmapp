'use client';

import { ChangeEvent, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";

type Item = {
    id: string;
    name: string;
    uploadedAt: string;
    status: "PENDING" | "VERIFIED";
};

const KEY = "retailer-prescriptions";

export default function RetailerPrescriptionsPage() {
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        const raw = localStorage.getItem(KEY);
        if (!raw) return;
        try {
            setItems(JSON.parse(raw));
        } catch {}
    }, []);

    const persist = (next: Item[]) => {
        setItems(next);
        localStorage.setItem(KEY, JSON.stringify(next));
    };

    const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const next: Item[] = [{
            id: crypto.randomUUID(),
            name: file.name,
            uploadedAt: new Date().toISOString(),
            status: "PENDING",
        }, ...items];
        persist(next);
        toast.success("Prescription uploaded");
        e.target.value = "";
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900">Prescriptions</h1>
                    <p className="text-slate-500 font-medium">Upload prescription files and track verification.</p>
                </div>
                <Button asChild>
                    <label className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" /> Upload
                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={onUpload} />
                    </label>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Uploaded Files</CardTitle>
                    <CardDescription>{items.length} files</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {items.length === 0 && (
                        <div className="text-sm text-slate-500">No prescriptions uploaded yet.</div>
                    )}
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <FileText className="h-4 w-4 text-slate-500" />
                                <div className="min-w-0">
                                    <p className="font-semibold truncate">{item.name}</p>
                                    <p className="text-xs text-slate-500">{new Date(item.uploadedAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <Badge variant="outline">{item.status}</Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
