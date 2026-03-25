import { WS_BASE_URL } from "@/lib/constants";

type MessageHandler = (data: unknown) => void;

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private conversationId: string;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(conversationId: string) {
    this.conversationId = conversationId;
  }

  connect(token?: string) {
    const params = token ? `?token=${token}` : "";
    const url = `${WS_BASE_URL}/api/v1/ws/chat/${this.conversationId}${params}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.emit("connected", null);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit("message", data);

        if (data.type) {
          this.emit(data.type, data);
        }
      } catch {
        this.emit("raw", event.data);
      }
    };

    this.ws.onclose = (event) => {
      this.emit("disconnected", { code: event.code, reason: event.reason });
      if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect(token);
      }
    };

    this.ws.onerror = () => {
      this.emit("error", { message: "WebSocket connection error" });
    };
  }

  private scheduleReconnect(token?: string) {
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    this.reconnectAttempts++;
    this.reconnectTimeout = setTimeout(() => this.connect(token), delay);
  }

  send(data: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  private emit(event: string, data: unknown) {
    this.handlers.get(event)?.forEach((handler) => handler(data));
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.ws?.close(1000, "Client disconnect");
    this.ws = null;
    this.handlers.clear();
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
