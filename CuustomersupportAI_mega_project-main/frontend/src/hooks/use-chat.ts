"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatWebSocket } from "@/services/websocket";
import type { Message } from "@/types";

interface UseChatOptions {
  conversationId: string;
  onMessage?: (message: Message) => void;
}

export function useChat({ conversationId, onMessage }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const wsRef = useRef<ChatWebSocket | null>(null);

  useEffect(() => {
    const ws = new ChatWebSocket(conversationId);
    wsRef.current = ws;

    ws.on("connected", () => setIsConnected(true));
    ws.on("disconnected", () => setIsConnected(false));

    ws.on("message", (data: unknown) => {
      const msg = data as { type?: string; message?: Message };
      if (msg.type === "chat_message" && msg.message) {
        setMessages((prev) => [...prev, msg.message!]);
        onMessage?.(msg.message);
      }
      if (msg.type === "typing_start") setIsTyping(true);
      if (msg.type === "typing_stop") setIsTyping(false);
    });

    ws.connect();

    return () => {
      ws.disconnect();
    };
  }, [conversationId, onMessage]);

  const sendMessage = useCallback(
    (content: string) => {
      wsRef.current?.send({
        type: "chat_message",
        content,
        conversation_id: conversationId,
      });
    },
    [conversationId]
  );

  const sendTyping = useCallback(() => {
    wsRef.current?.send({ type: "typing_start" });
  }, []);

  return {
    messages,
    setMessages,
    isConnected,
    isTyping,
    sendMessage,
    sendTyping,
  };
}
