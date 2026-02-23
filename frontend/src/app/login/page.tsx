"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, Shield, ChevronRight, Zap } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { scrollYProgress } = useScroll();
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const rotate1 = useTransform(smoothProgress, [0, 1], [0, 180]);
    const scale1 = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.2, 1.1]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.post("/auth/login", { email, password });
            const { access_token, user } = res.data;
            setAuth(user, access_token);
            toast.success(`Welcome back, ${user.name}!`);

            const roleRedirects: Record<string, string> = {
                ADMIN: "/dashboard/admin",
                DISTRIBUTOR: "/dashboard/distributor",
                RETAILER: "/dashboard/retailer",
                SALESMAN: "/dashboard/salesman",
            };
            router.push(roleRedirects[user.role] || "/search");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden relative selection:bg-primary/20">
            {/* --- Premium Light Background Layer --- */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    style={{ rotate: rotate1, scale: scale1 }}
                    className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-indigo-500/5 to-transparent blur-[120px] rounded-full"
                />
                {/* Floating Decorative Elements */}
                <div className="absolute top-[10%] left-[10%] opacity-[0.03] text-primary">
                    <Shield size={220} strokeWidth={0.5} />
                </div>
                {/* Micro-Pattern Grid */}
                <div className="absolute inset-0 opacity-[0.08]" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, #cbd5e1 1px, transparent 0)`,
                    backgroundSize: '48px 48px'
                }} />
                <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-slate-50" />
            </div>

            <div className="w-full max-w-[480px] relative z-10 px-6 py-12">
                {/* Logo Section */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="p-3 rounded-2xl bg-primary shadow-2xl shadow-primary/20 transition-transform group-hover:scale-110">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                            Pharma<span className="text-primary">flow</span>
                        </h1>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="space-y-2 pb-8 pt-10 text-center">
                            <CardTitle className="text-slate-900 text-3xl font-black tracking-tighter">Gateway</CardTitle>
                            <CardDescription className="text-slate-600 font-bold text-sm">
                                Authenticate your organization access
                            </CardDescription>
                        </CardHeader>

                        <form onSubmit={handleLogin}>
                            <CardContent className="space-y-6 px-8">
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-slate-700 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Universal Identity</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@pharmaflow.io"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-primary/20 h-14 rounded-2xl transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <Label htmlFor="password" className="text-slate-700 text-[10px] uppercase tracking-[0.2em] font-black">Secure Key</Label>
                                        <Link href="/forgot-password" className="text-[10px] text-primary font-black hover:text-slate-900 transition-colors uppercase tracking-widest">Forgot?</Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-slate-100/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-primary/50 focus:ring-primary/20 h-14 rounded-2xl transition-all shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Refined Quick Demo Logins */}
                                <div className="pt-6 border-t border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center mb-4 opacity-70">Single-Click Sandbox Access</span>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: "Admin", email: "admin@pharma.com", pwd: "admin123", icon: "👑", color: "hover:bg-blue-50" },
                                            { label: "Distributor", email: "dist0@pharma.com", pwd: "distributor123", icon: "🏢", color: "hover:bg-blue-50" },
                                            { label: "Retailer", email: "retailer0@pharma.com", pwd: "retailer123", icon: "🏪", color: "hover:bg-blue-50" },
                                            { label: "Salesman", email: "salesman0@pharma.com", pwd: "password123", icon: "💼", color: "hover:bg-blue-50" },
                                        ].map(({ label, email: demoEmail, pwd, icon, color }) => (
                                            <button
                                                key={label}
                                                type="button"
                                                onClick={() => { setEmail(demoEmail); setPassword(pwd); }}
                                                className={`group flex items-center justify-center gap-2 bg-slate-50 border border-slate-100 p-3 rounded-2xl transition-all duration-300 hover:border-primary/30 ${color}`}
                                            >
                                                <span className="text-sm opacity-50 group-hover:opacity-100 transition-opacity">{icon}</span>
                                                <span className="text-[10px] font-black text-slate-500 group-hover:text-primary uppercase tracking-tighter">{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col gap-6 pt-6 pb-12 px-8">
                                <Button
                                    type="submit"
                                    className="w-full h-16 rounded-[1.25rem] text-lg font-black tracking-tight shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-3">
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Verifying Identity...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Initiate Session <LogIn className="ml-1 h-5 w-5 opacity-80" />
                                        </span>
                                    )}
                                </Button>

                                <div className="flex items-center justify-center gap-2.5 text-xs">
                                    <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">New Network?</span>
                                    <Link href="/register" className="text-primary hover:text-slate-900 transition-colors font-black uppercase tracking-widest text-[10px] flex items-center gap-1 group">
                                        Join Ecosystem
                                        <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                </motion.div>

                {/* Footer Security Note */}
                <div className="mt-12 flex flex-col items-center gap-4 text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 opacity-80"><Shield size={14} className="text-primary" /> Encrypted Session</span>
                        <span className="flex items-center gap-2 opacity-80"><Zap size={14} className="fill-primary text-primary" /> 14ms Response</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

