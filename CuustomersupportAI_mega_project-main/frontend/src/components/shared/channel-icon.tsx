import {
  MessageSquare,
  Mail,
  MessageCircle,
  Smartphone,
  Hash,
  Users,
  Phone,
  Video,
} from "lucide-react";
import type { Channel } from "@/types";
import { cn } from "@/lib/utils";

const channelIcons: Record<Channel, React.ElementType> = {
  chat: MessageSquare,
  email: Mail,
  whatsapp: MessageCircle,
  sms: Smartphone,
  slack: Hash,
  teams: Users,
  voice: Phone,
  video: Video,
};

const channelColors: Record<Channel, string> = {
  chat: "text-blue-600 bg-blue-50",
  email: "text-purple-600 bg-purple-50",
  whatsapp: "text-green-600 bg-green-50",
  sms: "text-orange-600 bg-orange-50",
  slack: "text-pink-600 bg-pink-50",
  teams: "text-indigo-600 bg-indigo-50",
  voice: "text-teal-600 bg-teal-50",
  video: "text-cyan-600 bg-cyan-50",
};

interface ChannelIconProps {
  channel: Channel;
  size?: "sm" | "md" | "lg";
  showBackground?: boolean;
  className?: string;
}

export function ChannelIcon({
  channel,
  size = "md",
  showBackground = true,
  className,
}: ChannelIconProps) {
  const Icon = channelIcons[channel];
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };
  const bgSizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  if (!showBackground) {
    return (
      <Icon
        className={cn(
          sizeClasses[size],
          channelColors[channel].split(" ")[0],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg",
        bgSizeClasses[size],
        channelColors[channel],
        className
      )}
    >
      <Icon className={sizeClasses[size]} />
    </div>
  );
}
