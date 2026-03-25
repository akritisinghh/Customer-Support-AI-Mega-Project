"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    const u = getUser();
    if (!u || u.role !== "admin") { router.push("/login"); return; }
    setOk(true);
  }, [router]);

  if (!ok) return <div className="flex items-center justify-center h-screen text-slate-500">Loading...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar variant="admin" />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
