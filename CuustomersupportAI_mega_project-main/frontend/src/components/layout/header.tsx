"use client";

import React from "react";
import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUser } from "@/lib/auth";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, onMenuClick, actions }: HeaderProps) {
  const user = getUser();
  const displayName = user?.display_name || user?.email || "";
  const initials = displayName
    ? displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shrink-0">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center relative">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search..."
            className="w-64 pl-9 h-9 bg-slate-50 border-slate-200"
          />
        </div>
        {actions}
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="h-5 w-5 text-slate-500" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback className="text-xs bg-brand-100 text-brand-700 font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {displayName && (
            <span className="hidden lg:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
              {displayName}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
