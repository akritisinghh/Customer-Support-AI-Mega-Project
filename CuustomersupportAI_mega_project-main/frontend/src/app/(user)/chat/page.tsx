"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, Loader2, AlertCircle, Sparkles, MessageSquare, Zap, HelpCircle, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { api, ApiError } from "@/services/api";
import { isAuthenticated, getUser } from "@/lib/auth";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "agent" | "system";
  content: string;
  timestamp: Date;
  error?: boolean;
}

const SUGGESTIONS = [
  { icon: MessageSquare, text: "How do I reset my password?" },
  { icon: Zap, text: "What are your business hours?" },
  { icon: HelpCircle, text: "I need help with my billing" },
  { icon: Bot, text: "Tell me about your refund policy" },
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId] = useState(() => `conv-${Date.now()}`);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (!isAuthenticated()) router.push("/login"); }, [router]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (!isLoading) inputRef.current?.focus(); }, [isLoading]);

  // Poll for agent messages every 10s
  useEffect(() => {
    const interval = setInterval(async () => {
      if (messages.length === 0) return;
      try {
        const hist = await api.chatHistory(conversationId);
        const agentMsgs = hist.data.filter((m) => m.sender_type === "agent");
        const existingIds = new Set(messages.map((m) => m.id));
        const newAgentMsgs = agentMsgs.filter((m) => !existingIds.has(m.id));
        if (newAgentMsgs.length > 0) {
          setMessages((prev) => [
            ...prev,
            ...newAgentMsgs.map((m) => ({
              id: m.id,
              role: "agent" as const,
              content: m.content,
              timestamp: new Date(m.created_at),
            })),
          ]);
        }
      } catch { /* ignore polling errors */ }
    }, 10000);
    return () => clearInterval(interval);
  }, [conversationId, messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: content.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const resp = await api.chatCompletion(content.trim(), conversationId);
      setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, role: "assistant", content: resp.response, timestamp: new Date() }]);

      if (resp.needs_agent) {
        setMessages((prev) => [...prev, {
          id: `sys-${Date.now()}`,
          role: "system",
          content: "This query has been escalated to a human agent. You'll receive a response shortly.",
          timestamp: new Date(),
        }]);
      }
    } catch (err) {
      const msg = err instanceof ApiError && err.status === 401 ? "Session expired. Please sign in again." : "Failed to get a response. Please try again.";
      setError(msg);
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: "assistant", content: msg, timestamp: new Date(), error: true }]);
      if (err instanceof ApiError && err.status === 401) setTimeout(() => router.push("/login"), 2000);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, conversationId, router]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  const user = getUser();
  const initials = user?.display_name ? user.display_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "U";
  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-white">
      <Header title="Chat" subtitle="AI-powered support assistant" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full px-4 py-12">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 mb-6"><Sparkles className="h-8 w-8 text-brand-600" /></div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">How can I help you today?</h2>
              <p className="text-slate-500 mb-10 text-center max-w-md">Ask me anything. If I can&apos;t resolve your issue, I&apos;ll connect you with a human agent.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button key={s.text} onClick={() => sendMessage(s.text)} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-brand-200 transition-all text-left group">
                    <s.icon className="h-5 w-5 text-slate-400 group-hover:text-brand-500 shrink-0" />
                    <span className="text-sm text-slate-700">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-1">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-3 py-3 animate-fade-in", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role !== "user" && (
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                      <AvatarFallback className={cn("text-xs font-bold", msg.role === "system" ? "bg-yellow-100 text-yellow-700" : msg.role === "agent" ? "bg-green-100 text-green-700" : msg.error ? "bg-red-100 text-red-600" : "bg-brand-100 text-brand-700")}>
                        {msg.role === "system" ? <AlertTriangle className="h-4 w-4" /> : msg.role === "agent" ? "AG" : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user" ? "bg-brand-600 text-white rounded-br-md" :
                    msg.role === "system" ? "bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-bl-md" :
                    msg.role === "agent" ? "bg-green-50 text-green-800 border border-green-200 rounded-bl-md" :
                    msg.error ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-md" :
                    "bg-slate-100 text-slate-800 rounded-bl-md"
                  )}>
                    {msg.role === "agent" && <p className="text-[10px] font-semibold text-green-600 mb-1">Agent reply</p>}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <p className={cn("text-[10px] mt-2 opacity-60", msg.role === "user" ? "text-right" : "")}>{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5"><AvatarFallback className="text-xs bg-slate-200 text-slate-700 font-bold">{initials}</AvatarFallback></Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 py-3 animate-fade-in">
                  <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className="text-xs bg-brand-100 text-brand-700"><Bot className="h-4 w-4" /></AvatarFallback></Avatar>
                  <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {error && !isLoading && (
          <div className="px-4 pb-2 max-w-3xl mx-auto w-full">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /><span className="flex-1">{error}</span>
              <button onClick={() => { const last = [...messages].reverse().find((m) => m.role === "user"); if (last) sendMessage(last.content); }} className="flex items-center gap-1 font-medium"><RotateCcw className="h-3.5 w-3.5" />Retry</button>
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 bg-white px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message..." disabled={isLoading} rows={1}
              className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 max-h-32 scrollbar-thin"
              style={{ minHeight: "48px" }}
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "48px"; t.style.height = Math.min(t.scrollHeight, 128) + "px"; }}
            />
            <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} className="h-12 w-12 rounded-xl shrink-0" size="icon">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-3">Nexora AI may produce inaccurate information. Queries may be escalated to human agents.</p>
        </div>
      </div>
    </div>
  );
}
