import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function BlueBadge({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <BadgeCheck 
      size={size} 
      className={cn("text-[#1D9BF0] fill-white shrink-0", className)} 
    />
  );
}
