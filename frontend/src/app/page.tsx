"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Box, ShieldCheck, TrendingUp, Users, Shield, Zap, Globe, BarChart3 } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Grainient Animation Transforms
  const rotate1 = useTransform(smoothProgress, [0, 1], [0, 180]);
  const rotate2 = useTransform(smoothProgress, [0, 1], [45, 225]);
  const rotate3 = useTransform(smoothProgress, [0, 1], [-45, 135]);

  const scale1 = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.5, 1.2]);
  const y1 = useTransform(smoothProgress, [0, 1], [0, -200]);
  const x1 = useTransform(smoothProgress, [0, 1], [0, 100]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden relative selection:bg-primary/20">
      {/* --- Grainient Style Background Layer --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Dynamic Gradient Waves (Grainient Style) */}
        <motion.div
          style={{ rotate: rotate1, scale: scale1, y: y1, x: x1 }}
          className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-indigo-500/10 to-transparent blur-[120px] rounded-full"
        />
        <motion.div
          style={{ rotate: rotate2, scale: scale1, y: y1 }}
          className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-500/10 via-orange-500/5 to-transparent blur-[140px] rounded-full"
        />
        <motion.div
          style={{ rotate: rotate3, x: x1 }}
          className="absolute top-[20%] right-[-20%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-teal-500/5 to-transparent blur-[120px] rounded-full"
        />

        {/* Animated Light Streaks (Matches the Grainient Image) */}
        <motion.div
          style={{ rotate: rotate1, opacity: useTransform(smoothProgress, [0, 0.5], [0.3, 0.6]) }}
          className="absolute top-[10%] left-[20%] w-[1px] h-[800px] bg-gradient-to-b from-transparent via-blue-400 to-transparent skew-x-[30deg] blur-sm"
        />
        <motion.div
          style={{ rotate: rotate2, opacity: useTransform(smoothProgress, [0.2, 0.7], [0.1, 0.4]) }}
          className="absolute top-[20%] left-[30%] w-[2px] h-[600px] bg-gradient-to-b from-transparent via-rose-400 to-transparent skew-x-[-20deg] blur-md"
        />
        <motion.div
          style={{ rotate: rotate3, opacity: useTransform(smoothProgress, [0.4, 1], [0.1, 0.3]) }}
          className="absolute bottom-[10%] right-[30%] w-[1px] h-[700px] bg-gradient-to-b from-transparent via-indigo-400 to-transparent skew-x-[45deg] blur-sm"
        />

        {/* Floating Decorative Elements (Subtle) */}
        <div className="absolute top-[20%] left-[15%] opacity-[0.03] text-primary">
          <Box size={120} strokeWidth={0.5} />
        </div>
        <div className="absolute top-[50%] right-[20%] opacity-[0.02] text-indigo-500 transform rotate-12">
          <Shield size={180} strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-[20%] left-[10%] opacity-[0.02] text-emerald-500 -rotate-12">
          <TrendingUp size={140} strokeWidth={0.5} />
        </div>

        {/* Micro-Pattern Grid */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #cbd5e1 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/10 to-slate-50" />
      </div>

      {/* --- Navigation --- */}
      <header className="px-6 lg:px-12 h-20 flex items-center border-b border-slate-200 bg-white/70 backdrop-blur-2xl sticky top-0 z-50">
        <Link className="flex items-center gap-2 group" href="/">
          <div className="p-1.5 rounded-xl bg-primary transition-transform group-hover:scale-110">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tighter">
            Pharma<span className="text-primary">flow</span>
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-8">
          <Link className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors hidden sm:block" href="#features">
            Infrastructure
          </Link>
          <Link className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors" href="/login">
            Partner Login
          </Link>
          <Link href="/register">
            <Button className="bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-full px-6 shadow-lg shadow-slate-900/10 transition-all transform hover:scale-105 active:scale-95">
              Join Marketplace
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* --- Hero Section --- */}
        <section className="w-full py-20 lg:py-32 xl:py-48 flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center space-y-10 text-center"
            >
              {/* Pro Badge */}
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary gap-2 shadow-sm">
                <Zap className="h-3 w-3 fill-primary animate-pulse" /> Kerala's #1 Supply Chain OS
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl font-black tracking-tighter sm:text-7xl md:text-8xl lg:text-[100px] leading-[0.9] text-slate-900">
                  The <span className="text-primary">Genetic</span> Protocol <br className="hidden md:block" />
                  for Pharma B2B
                </h1>
                <p className="mx-auto max-w-[800px] text-slate-600 font-medium md:text-xl lg:text-2xl leading-relaxed">
                  The definitive operating system for South India's medical retailers.
                  <span className="text-slate-900 font-bold"> Professional. Reliable. Instant.</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="xl" className="w-full sm:w-auto h-16 px-10 text-lg font-black bg-primary hover:bg-primary/90 rounded-2xl shadow-[0_20px_50px_rgba(30,58,138,0.3)] text-white transition-all transform hover:scale-[1.03] active:scale-95">
                    Open Workspace <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto h-16 px-10 text-lg font-black border-slate-300 bg-white hover:bg-slate-50 rounded-2xl transition-all shadow-sm text-slate-900">
                    Partner Access
                  </Button>
                </Link>
              </div>

              {/* Trust Stats */}
              <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 opacity-90">
                <div>
                  <div className="text-2xl font-black text-slate-900">100k+</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Master SKUs</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">₹500Cr+</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Total Volume</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">99.9%</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Network Uptime</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">14s</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Avg Lag</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- Features Section --- */}
        <section id="features" className="w-full py-24 bg-white/50 relative border-t border-slate-200">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-primary">Core Infrastructure</h2>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">Everything required to <br /> scale your medical chain</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <Box className="h-6 w-6" />,
                  title: "Neural Inventory",
                  desc: "Intelligent stock forecasting and automated replenishment logic.",
                  color: "bg-blue-50 text-blue-600"
                },
                {
                  icon: <Users className="h-6 w-6" />,
                  title: "Smart CRM",
                  desc: "Real-time salesman network tracking with automated commissions.",
                  color: "bg-indigo-50 text-indigo-600"
                },
                {
                  icon: <TrendingUp className="h-6 w-6" />,
                  title: "Cloud Scale",
                  desc: "Architected for zero-latency during peak morning rush hours.",
                  color: "bg-emerald-50 text-emerald-600"
                },
                {
                  icon: <ShieldCheck className="h-6 w-6" />,
                  title: "Data Vault",
                  desc: "Bank-grade encryption for all patient and transaction records.",
                  color: "bg-orange-50 text-orange-600"
                }
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-8 rounded-[2rem] border border-slate-100 bg-white hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className={`p-4 ${f.color} rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="w-full py-12 border-t border-slate-200 relative z-10 bg-slate-50">
        <div className="container px-4 md:px-6 flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-lg font-black text-slate-900 tracking-tighter">Pharmaflow</span>
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">© 2026 South India Ledger Systems PVT LTD.</p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6 text-[10px] text-slate-600 font-black uppercase tracking-widest">
            <nav className="flex gap-8">
              <Link className="hover:text-primary transition-colors" href="#">System Standard</Link>
              <Link className="hover:text-primary transition-colors" href="#">Legal</Link>
              <Link className="hover:text-primary transition-colors" href="#">Developer API</Link>
            </nav>
            <div className="flex items-center gap-4 text-slate-500 font-bold">
              <Shield className="h-4 w-4" /> ISO-Secure Framework
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

