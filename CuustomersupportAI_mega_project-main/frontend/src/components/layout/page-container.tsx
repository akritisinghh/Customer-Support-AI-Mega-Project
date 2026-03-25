import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("flex-1 overflow-auto", className)}>
      <div className="p-6 max-w-7xl mx-auto animate-fade-in">{children}</div>
    </div>
  );
}
