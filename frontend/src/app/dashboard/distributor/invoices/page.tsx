'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function InvoicesPage() {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900">Financial Ledger</h1>
                    <p className="text-slate-500 font-medium">Download and verify automated tax invoices.</p>
                </div>
                <Button variant="outline" className="border-slate-200 font-bold rounded-xl h-12 px-6">
                    <Download className="h-4 w-4 mr-2" /> Bulk Export
                </Button>
            </div>

            <Card className="border-slate-100 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                    <CardTitle className="font-black text-slate-800">Generated Documents</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Compliance-ready GST invoices</CardDescription>
                </CardHeader>
                <CardContent className="p-12 text-center">
                    <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <FileText className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Archives Empty</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 font-medium">No invoices have been generated for the current billing cycle.</p>
                </CardContent>
            </Card>
        </div>
    );
}
