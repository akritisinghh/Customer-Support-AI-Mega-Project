"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { api } from "@/services/api";

const ROLES = [
  { value: "user", label: "User", desc: "Get AI-powered support for your queries" },
  { value: "agent", label: "Agent", desc: "Respond to customer queries and manage tickets" },
  { value: "admin", label: "Admin", desc: "Monitor system, manage users and escalations" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.register(email, password, displayName, role);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50 px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/25 mb-4">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Nexora</h1>
          <p className="text-sm text-slate-500 mt-1">Create your account</p>
        </div>

        <Card className="shadow-xl border-slate-200/60">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>Choose your role and get started</CardDescription>
          </CardHeader>

          {success ? (
            <CardContent className="pb-8">
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="text-lg font-semibold text-slate-900">Account created!</p>
                <p className="text-sm text-slate-500">Redirecting to sign in...</p>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

                {/* Role selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">I am signing up as</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`rounded-lg border-2 p-3 text-center transition-all ${role === r.value ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
                      >
                        <p className="text-sm font-semibold">{r.label}</p>
                        <p className="text-[10px] mt-0.5 leading-tight opacity-70">{r.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-slate-700">Full name</label>
                  <Input id="name" placeholder="Your full name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                  <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button className="w-full h-11 text-sm font-semibold" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : "Create Account"}
                </Button>
              </CardContent>
            </form>
          )}

          <CardFooter className="justify-center pb-6">
            <p className="text-sm text-slate-500">Already have an account?{" "}<Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold">Sign in</Link></p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
