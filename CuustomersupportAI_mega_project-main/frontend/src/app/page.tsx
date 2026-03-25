import Link from "next/link";
import {
  MessageSquare,
  Bot,
  Phone,
  Video,
  Ticket,
  Brain,
  BarChart3,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MessageSquare,
    title: "Omni-Channel Support",
    description:
      "Unified conversations across chat, email, WhatsApp, SMS, Slack, Teams, voice, and video.",
  },
  {
    icon: Bot,
    title: "AI Chatbot with RAG",
    description:
      "Knowledge-base powered chatbot with retrieval-augmented generation and context-aware answers.",
  },
  {
    icon: Phone,
    title: "Voice AI",
    description:
      "Speech-to-text, AI voice agent, call recording, and real-time call assistance.",
  },
  {
    icon: Video,
    title: "Video Support",
    description:
      "Video calls with screen sharing, AI transcription, and automatic call summarization.",
  },
  {
    icon: Ticket,
    title: "Smart Ticketing",
    description:
      "Auto ticket creation, AI categorization, priority detection, smart routing, and SLA tracking.",
  },
  {
    icon: Brain,
    title: "Agent Copilot",
    description:
      "AI-suggested replies, knowledge retrieval, ticket summaries, and one-click responses.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "CSAT scoring, sentiment analytics, resolution time, agent performance, and AI metrics.",
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description:
      "PII detection, data masking, RBAC, audit logs, GDPR compliance, and secure APIs.",
  },
  {
    icon: Zap,
    title: "Smart Automation",
    description:
      "Auto-reply generation, ticket closing, escalation workflows, and SLA breach alerts.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description:
      "Automatic language detection, AI translation, and cross-language support for global teams.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Nexora
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/40 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-8 border border-brand-100">
            <Sparkles className="h-4 w-4" />
            AI-Native Customer Support
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8 leading-[1.1]">
            Customer support,
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              powered by intelligence
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Nexora combines AI agents, omni-channel messaging, and smart
            automation to resolve customer issues faster — across chat, voice,
            email, and more.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2 h-12 px-8 text-base">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline" className="gap-2 h-12 px-8 text-base">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-slate-50/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need for modern support
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A complete AI platform that brings together every channel,
              intelligence layer, and automation tool your team needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg hover:border-brand-200 transition-all duration-200 group"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 group-hover:bg-brand-100 transition-colors mb-4">
                  <feature.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-600" />
            <span className="font-medium">Nexora</span>
          </div>
          <p>Built with Next.js, FastAPI, Groq AI, and Supabase</p>
        </div>
      </footer>
    </div>
  );
}
