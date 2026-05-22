import { Progress } from "@/components/ui/progress";
import { VoteStats } from "@workspace/api-client-react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function VoteMeter({ 
  stats, 
  className,
  showLabel = true 
}: { 
  stats?: VoteStats | null;
  className?: string;
  showLabel?: boolean;
}) {
  const percentage = stats ? (stats.totalVotes / stats.goalVotes) * 100 : 0;
  
  return (
    <div className={cn("space-y-2 w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-end text-sm font-medium">
          <span className="text-foreground flex items-center gap-1">
            <Heart size={14} className="fill-primary text-primary" /> 
            {stats?.totalVotes.toLocaleString() || 0} Votes
          </span>
          <span className="text-muted-foreground text-xs">
            Goal: {stats?.goalVotes.toLocaleString() || 0}
          </span>
        </div>
      )}
      <div className="relative h-4 rounded-full bg-secondary overflow-hidden border border-border/50 shadow-inner">
        <div 
          className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-primary to-[#ff8f8f] transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      {stats?.nextMilestone && showLabel && (
        <div className="text-right text-[10px] text-muted-foreground">
          {stats.nextMilestone.votes - stats.totalVotes > 0 
            ? `${(stats.nextMilestone.votes - stats.totalVotes).toLocaleString()} to next milestone!`
            : "Milestone reached!"}
        </div>
      )}
    </div>
  );
}
