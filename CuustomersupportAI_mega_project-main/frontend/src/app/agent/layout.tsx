"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    const u = getUser();
    if (!u || (u.role !== "agent" && u.role !== "admin")) { router.push("/login"); return; }
    setOk(true);
  }, [router]);

  if (!ok) return <div className="flex items-center justify-center h-screen text-slate-500">Loading...</div>;
  return <div className="flex h-screen"><Sidebar variant="agent" /><main className="flex-1 overflow-auto bg-slate-50">{children}</main></div>;
}
