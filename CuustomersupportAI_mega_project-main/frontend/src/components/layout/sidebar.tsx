"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { clearAuth, getUser } from "@/lib/auth";
import {
  MessageSquare,
  Ticket,
  HelpCircle,
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  Sparkles,
  LogOut,
  BarChart3,
  Headphones,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Knowledge Base", href: "/admin/knowledge-base", icon: BookOpen },
  { label: "Agents", href: "/admin/agents", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/ai-config", icon: Settings },
];

const agentNav: NavItem[] = [
  { label: "Dashboard", href: "/agent", icon: Headphones },
];

const userNav: NavItem[] = [
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Tickets", href: "/tickets", icon: Ticket },
  { label: "Help Center", href: "/help", icon: HelpCircle },
];

interface SidebarProps {
  variant: "admin" | "agent" | "user";
}

export function Sidebar({ variant }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const initials = user?.display_name
    ? user.display_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  const isActive = (href: string) => {
    if (href === "/admin" || href === "/agent") return pathname === href;
    return pathname.startsWith(href);
  };

  const sections: { title: string; items: NavItem[] }[] = [];
  if (variant === "admin") {
    sections.push({ title: "Admin", items: adminNav });
    sections.push({ title: "Agent", items: agentNav });
    sections.push({ title: "Support", items: userNav });
  } else if (variant === "agent") {
    sections.push({ title: "Agent", items: agentNav });
    sections.push({ title: "Support", items: userNav });
  } else {
    sections.push({ title: "Support", items: userNav });
  }

  return (
    <aside className="flex flex-col h-screen w-60 bg-sidebar border-r border-slate-800 sticky top-0 shrink-0">
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-600 shrink-0">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="text-base font-bold text-white tracking-tight">Nexora</span>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
        {sections.map((section) => (
          <div key={section.title} className="mb-3">
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-text/60">{section.title}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link key={item.href} href={item.href}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.href) ? "bg-sidebar-active text-sidebar-text-active" : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active")}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800 shrink-0">
        <button onClick={() => { clearAuth(); router.push("/login"); }}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active transition-colors">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white text-[10px] font-bold shrink-0">{initials}</div>
          <span className="truncate">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
