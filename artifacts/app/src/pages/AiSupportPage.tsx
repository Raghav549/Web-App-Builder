import { useLocation } from "wouter";
import { useGetVoteStats, useGetSupporters, useCastVote } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { VoteMeter } from "@/components/shared/VoteMeter";
import { BlueBadge } from "@/components/ui/BlueBadge";
import { Heart, ArrowLeft, Trophy, Medal, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function AiSupportPage() {
  const [, setLocation] = useLocation();
  const { data: voteStats, isLoading: isLoadingStats } = useGetVoteStats();
  const { data: supportersData, isLoading: isLoadingSupporters } = useGetSupporters({ limit: 10 });
  const castVote = useCastVote();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = () => {
    setIsVoting(true);
    castVote.mutate(undefined, {
      onSuccess: (res) => {
        setIsVoting(false);
        toast({
          title: "Vote cast!",
          description: `Thanks for supporting Ai! Total votes: ${res.totalVotes}`,
        });
      },
      onError: (err: any) => {
        setIsVoting(false);
        toast({
          variant: "destructive",
          title: "Couldn't vote",
          description: err.message || "Something went wrong.",
        });
      }
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => window.history.back()}>
          <ArrowLeft size={20} />
        </Button>
        <span className="font-bold text-lg text-foreground">Support Ai</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 pb-20">
        <div className="bg-card border border-card-border rounded-[2rem] p-6 shadow-md relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 -z-10"></div>
          
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-sm overflow-hidden bg-muted mb-4">
            <img src="/ai-avatar.png" alt="Ai" className="w-full h-full object-cover" />
          </div>
          
          <h2 className="text-xl font-bold mb-1">Cheer for Ai!</h2>
          <p className="text-sm text-muted-foreground mb-6">Every vote helps her reach the top.</p>
          
          <Button 
            onClick={handleVote}
            disabled={castVote.isPending}
            className={cn(
              "w-full max-w-[200px] h-16 rounded-full text-lg font-bold shadow-lg transition-all duration-300",
              isVoting ? "scale-95 bg-primary/80" : "hover:scale-105 shadow-primary/30"
            )}
          >
            <Heart className={cn("mr-2", isVoting ? "fill-current animate-ping" : "fill-current")} size={24} />
            Vote Now
          </Button>

          <div className="w-full mt-8">
            {isLoadingStats ? <Skeleton className="h-10 w-full" /> : <VoteMeter stats={voteStats} />}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Trophy size={20} className="text-primary" /> Milestones
          </h3>
          
          <div className="space-y-3">
            {voteStats?.milestones?.map((milestone, idx) => (
              <div key={idx} className={cn(
                "p-4 rounded-2xl border flex items-center justify-between",
                milestone.achieved ? "bg-primary/10 border-primary/20" : "bg-card border-card-border opacity-60"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    milestone.achieved ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <Medal size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{milestone.label}</p>
                    <p className="text-xs text-muted-foreground">{milestone.votes.toLocaleString()} votes</p>
                  </div>
                </div>
                {milestone.achieved && <Star className="text-primary fill-primary" size={16} />}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Heart size={20} className="text-accent-foreground" /> Top Supporters
          </h3>
          
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
            {isLoadingSupporters ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-4 border-b border-border/50 flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))
            ) : supportersData?.supporters.map((supporter, idx) => (
              <div key={supporter.id} className="p-4 border-b border-border/50 last:border-0 flex items-center gap-3">
                <div className="w-6 text-center font-bold text-sm text-muted-foreground">
                  {idx + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                  {supporter.avatarUrl ? (
                    <img src={supporter.avatarUrl} alt={supporter.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-bold">
                      {supporter.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm">{supporter.name}</span>
                    {supporter.isVerified && <BlueBadge size={12} />}
                  </div>
                  <span className="text-xs text-muted-foreground">@{supporter.username}</span>
                </div>
                <div className="font-bold text-sm text-primary flex items-center gap-1">
                  {supporter.voteCount} <Heart size={12} className="fill-current" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
