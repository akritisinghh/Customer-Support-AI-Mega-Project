"use client";

import React from "react";
import {
  Search,
  BookOpen,
  CreditCard,
  Wrench,
  Zap,
  Shield,
  Users,
  LifeBuoy,
  ChevronRight,
  ArrowRight,
  MessageSquare,
  FileText,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";

interface Category {
  icon: React.ElementType;
  title: string;
  description: string;
  articleCount: number;
  color: string;
}

const categories: Category[] = [
  {
    icon: Zap,
    title: "Getting Started",
    description: "Quick setup guides and first steps",
    articleCount: 12,
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: CreditCard,
    title: "Account & Billing",
    description: "Plans, payments, invoices, and account settings",
    articleCount: 18,
    color: "text-green-600 bg-green-50",
  },
  {
    icon: Wrench,
    title: "Technical Support",
    description: "Troubleshooting, integrations, and API help",
    articleCount: 24,
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    description: "SSO, 2FA, data protection, and compliance",
    articleCount: 9,
    color: "text-red-600 bg-red-50",
  },
  {
    icon: Users,
    title: "Team & Collaboration",
    description: "User management, roles, and permissions",
    articleCount: 14,
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Managing articles, categories, and content",
    articleCount: 11,
    color: "text-indigo-600 bg-indigo-50",
  },
];

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  views: number;
}

const popularArticles: Article[] = [
  {
    id: "a1",
    title: "How to reset your password",
    category: "Account & Billing",
    readTime: "2 min",
    views: 4280,
  },
  {
    id: "a2",
    title: "Setting up SSO with SAML 2.0",
    category: "Security & Privacy",
    readTime: "5 min",
    views: 3190,
  },
  {
    id: "a3",
    title: "Getting started with the REST API",
    category: "Technical Support",
    readTime: "8 min",
    views: 2850,
  },
  {
    id: "a4",
    title: "Configuring webhook notifications",
    category: "Technical Support",
    readTime: "4 min",
    views: 2340,
  },
  {
    id: "a5",
    title: "Understanding your billing cycle",
    category: "Account & Billing",
    readTime: "3 min",
    views: 2120,
  },
  {
    id: "a6",
    title: "Adding team members and setting roles",
    category: "Team & Collaboration",
    readTime: "3 min",
    views: 1980,
  },
  {
    id: "a7",
    title: "Upgrading from Pro to Enterprise",
    category: "Account & Billing",
    readTime: "2 min",
    views: 1750,
  },
  {
    id: "a8",
    title: "Connecting your WhatsApp Business account",
    category: "Getting Started",
    readTime: "6 min",
    views: 1640,
  },
];

export default function HelpCenterPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Help Center" subtitle="Find answers and get support" />

      <PageContainer>
        {/* Hero search */}
        <div className="relative rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 md:p-12 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              How can we help you?
            </h2>
            <p className="text-brand-200 text-sm mb-6">
              Search our knowledge base or browse categories below
            </p>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                placeholder="Search for articles, guides, and FAQs..."
                className="w-full h-12 rounded-xl bg-white pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Browse by category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card
                key={cat.title}
                className="group hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex items-center justify-center h-11 w-11 rounded-xl shrink-0 ${cat.color}`}
                    >
                      <cat.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors mb-1">
                        {cat.title}
                      </h4>
                      <p className="text-xs text-slate-500 mb-2">
                        {cat.description}
                      </p>
                      <span className="text-xs text-slate-400">
                        {cat.articleCount} articles
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand-500 shrink-0 mt-1 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular articles */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-900">
              Popular articles
            </h3>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {popularArticles.map((article) => (
              <button
                key={article.id}
                className="w-full flex items-center gap-4 p-4 hover:bg-slate-50/60 transition-colors text-left group"
              >
                <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-slate-50 shrink-0">
                  <FileText className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 group-hover:text-brand-600 transition-colors">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-400">
                      {article.category}
                    </span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400">
                      {article.readTime} read
                    </span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400">
                      {article.views.toLocaleString()} views
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-500 shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Contact support CTA */}
        <Card className="border-brand-100 bg-gradient-to-r from-brand-50/50 to-white">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-brand-100 shrink-0">
                <LifeBuoy className="h-8 w-8 text-brand-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  Can&apos;t find what you&apos;re looking for?
                </h3>
                <p className="text-sm text-slate-500">
                  Our support team is available 24/7 to help you with any
                  questions or issues.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Start a Chat
                </Button>
                <Button className="gap-2">
                  <LifeBuoy className="h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
