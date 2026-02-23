'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");

    return (
        <main className="max-w-md mx-auto px-4 py-14 space-y-4">
            <h1 className="text-3xl font-black">Forgot Password</h1>
            <p className="text-slate-600">Enter your account email to request a reset link.</p>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@pharmaflow.io" />
            <Button onClick={() => toast.success("Reset flow is not enabled yet. Contact admin to reset password.")}>Request Reset</Button>
        </main>
    );
}
