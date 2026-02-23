"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, UserPlus, Check, Shield, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const steps = ["Account Type", "Company Details", "Review & Submit"];

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        role: "DISTRIBUTOR",
        name: "",
        email: "",
        password: "",
        phone: "",
        companyName: "",
        address: "",
        district: "",
        gstNumber: "",
        shopName: "",
        pincode: "",
    });

    const { scrollYProgress } = useScroll();
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const rotate1 = useTransform(smoothProgress, [0, 1], [0, 180]);
    const scale1 = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.2, 1.1]);

    const districts = [
        "Ernakulam", "Kozhikode", "Trivandrum", "Thrissur", "Kannur",
        "Kollam", "Palakkad", "Kottayam", "Kasaragod", "Malappuram", "Wayanad", "Idukki", "Pathanamthitta", "Alappuzha"
    ];

    const update = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await api.post("/auth/register", form);
            toast.success("Registration successful! Awaiting admin approval.");
            router.push("/login");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 overflow-x-hidden relative selection:bg-primary/20 p-4 sm:p-8">
            {/* --- Premium Light Background Layer --- */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    style={{ rotate: rotate1, scale: scale1 }}
                    className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-indigo-500/5 to-transparent blur-[120px] rounded-full"
                />
                <div className="absolute top-[10%] right-[10%] opacity-[0.03] text-primary">
                    <Shield size={250} strokeWidth={0.5} />
                </div>
                {/* Micro-Pattern Grid */}
                <div className="absolute inset-0 opacity-[0.08]" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, #cbd5e1 1px, transparent 0)`,
                    backgroundSize: '48px 48px'
                }} />
                <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-slate-50" />
            </div>

            <div className="w-full max-w-2xl relative z-10">
                {/* Header Section */}
                <div className="text-center mb-10 animate-in fade-in slide-in-from-top-8 duration-700">
                    <Link href="/" className="inline-flex items-center gap-3 group mb-6">
                        <div className="p-3 rounded-2xl bg-primary shadow-2xl shadow-primary/20 transition-transform group-hover:scale-110">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                            Pharma<span className="text-primary">flow</span>
                        </h1>
                    </Link>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Expand the Network</h2>
                    <p className="text-slate-500 mt-2 font-medium">South India's most reliable pharma supply chain OS.</p>
                </div>

                {/* --- Stepper --- */}
                <div className="flex items-center justify-center gap-0 mb-12 max-w-lg mx-auto">
                    {steps.map((s, i) => (
                        <div key={s} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center group relative">
                                <div className={`flex items-center justify-center h-10 w-10 rounded-2xl font-black text-sm transition-all shadow-sm ${i < step ? "bg-emerald-500 text-white" :
                                    i === step ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" :
                                        "bg-white border border-slate-300 text-slate-500 group-hover:border-primary/50"
                                    }`}>
                                    {i < step ? <Check className="h-5 w-5" /> : i + 1}
                                </div>
                                <span className={`absolute -bottom-7 text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${i === step ? "text-primary" : "text-slate-500"}`}>{s}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className="flex-1 mx-4">
                                    <div className={`h-[2px] w-full rounded-full transition-all ${i < step ? "bg-emerald-500" : "bg-slate-300"}`} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-slate-200/60 bg-white/70 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="pb-4 pt-10 px-10">
                            <CardTitle className="text-slate-900 text-2xl font-black tracking-tight">{steps[step]}</CardTitle>
                            <CardDescription className="text-slate-600 font-bold">
                                {step === 0 && "Configure your organization profile"}
                                {step === 1 && "Verifiable business credentials"}
                                {step === 2 && "Final verification of ledger details"}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-10 pt-4 space-y-6">
                            {/* Step 0: Account Type */}
                            {step === 0 && (
                                <div className="grid gap-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { role: "DISTRIBUTOR", icon: "🏢", title: "Distributor", desc: "Wholesale Distribution" },
                                            { role: "RETAILER", icon: "🏪", title: "Retailer", desc: "Medical Dispensary" },
                                        ].map(({ role, icon, title, desc }) => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => update("role", role)}
                                                className={`p-5 rounded-3xl border-2 text-left transition-all group ${form.role === role
                                                    ? "border-primary bg-primary/5 shadow-inner"
                                                    : "border-slate-100 bg-slate-50/50 hover:border-slate-300"
                                                    }`}
                                            >
                                                <div className="text-3xl mb-3 flex items-center justify-between">
                                                    <span>{icon}</span>
                                                    {form.role === role && <Check className="h-5 w-5 text-primary" />}
                                                </div>
                                                <div className={`font-black uppercase tracking-tighter text-lg ${form.role === role ? "text-primary" : "text-slate-900"}`}>{title}</div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{desc}</div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">Responsible Agent</Label>
                                            <Input placeholder="Enter your full legal name" value={form.name} onChange={(e) => update("name", e.target.value)}
                                                className="bg-slate-50 border-slate-200 text-slate-900 h-14 rounded-2xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">Official Email</Label>
                                            <Input type="email" placeholder="admin@organization.com" value={form.email} onChange={(e) => update("email", e.target.value)}
                                                className="bg-slate-50 border-slate-200 text-slate-900 h-14 rounded-2xl" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">Contact Phone</Label>
                                                <Input placeholder="+91 0000 0000 00" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                                                    className="bg-slate-50 border-slate-200 text-slate-900 h-14 rounded-2xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">Secure Password</Label>
                                                <Input type="password" placeholder="••••••••" value={form.password} onChange={(e) => update("password", e.target.value)}
                                                    className="bg-slate-50 border-slate-200 text-slate-900 h-14 rounded-2xl" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 1: Company Details */}
                            {step === 1 && (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">
                                            {form.role === "DISTRIBUTOR" ? "Registered Company Name" : "Medical Shop Branding"}
                                        </Label>
                                        <Input placeholder={form.role === "DISTRIBUTOR" ? "e.g. Kerala Medicos Distributors" : "e.g. City Apollo Pharmacy"} value={form.role === "DISTRIBUTOR" ? form.companyName : form.shopName}
                                            onChange={(e) => update(form.role === "DISTRIBUTOR" ? "companyName" : "shopName", e.target.value)}
                                            className="bg-slate-50 border-slate-200 text-slate-900 h-14 rounded-2xl" />
                                    </div>

                                    {form.role === "DISTRIBUTOR" && (
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">GST Identification (GSTIN)</Label>
                                            <Input placeholder="32AABCM1234Q1ZM" value={form.gstNumber} onChange={(e) => update("gstNumber", e.target.value)}
                                                className="bg-slate-50 border-slate-200 text-slate-900 h-14 rounded-2xl" />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">Primary Physical Location</Label>
                                        <Input placeholder="Suite #, Building, Street Address" value={form.address} onChange={(e) => update("address", e.target.value)}
                                            className="bg-slate-50 border-slate-200 text-slate-900 h-14 rounded-2xl" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">Operation District</Label>
                                            <Select value={form.district} onValueChange={(v) => update("district", v)}>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-14 rounded-2xl">
                                                    <SelectValue placeholder="Select one" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {districts.map(d => <SelectItem key={d} value={d} className="font-medium">{d}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 text-[10px] font-black uppercase tracking-widest ml-1">Area Pincode</Label>
                                            <Input placeholder="680001" value={form.pincode} onChange={(e) => update("pincode", e.target.value)}
                                                className="bg-slate-50 border-slate-300 text-slate-900 h-14 rounded-2xl placeholder:text-slate-500" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Review */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] space-y-3">
                                        {[
                                            ["Agent Identity", form.name],
                                            ["Universal Email", form.email],
                                            ["Entity Name", form.companyName || form.shopName],
                                            ["Jurisdiction", `${form.district}, Kerala - ${form.pincode}`],
                                            ["Classification", form.role],
                                            ["Verification ID", form.gstNumber || "Not Provided"],
                                        ].map(([label, value]) => (
                                            <div key={label} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                                                <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{label}</span>
                                                <span className="text-slate-900 text-sm font-black text-right">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 items-start">
                                        <Shield className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                            By submitting, you agree to the <span className="font-black underline">Electronic Ledger Terms</span>. Your access will be activated pending administrative vetting (usually &lt; 24h).
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex gap-4 pb-12 pt-4 px-10">
                            {step > 0 && (
                                <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50" onClick={() => setStep(s => s - 1)}>
                                    Revised
                                </Button>
                            )}
                            {step < steps.length - 1 ? (
                                <Button className="flex-1 bg-primary text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" onClick={() => setStep(s => s + 1)}>
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button className="flex-1 bg-primary text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" onClick={handleSubmit} disabled={isLoading}>
                                    {isLoading ? "Vetting..." : <><UserPlus className="h-4 w-4 mr-2" /> Commit Application</>}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </motion.div>

                <p className="text-center mt-8 text-slate-500 font-medium">
                    Already a network partner? <Link href="/login" className="text-primary font-black hover:underline ml-1">Establish Connection</Link>
                </p>
            </div>
        </div>
    );
}

