import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useGetFeed, useGetVoteStats, useCastVote, useLikePost, useUnlikePost } from "@workspace/api-client-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { VoteMeter } from "@/components/shared/VoteMeter";
import { BlueBadge } from "@/components/ui/BlueBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: feedData, isLoading: isLoadingFeed } = useGetFeed();
  const { data: voteStats, isLoading: isLoadingStats } = useGetVoteStats();
  const castVote = useCastVote();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = () => {
    if (!user) { setLocation("/login"); return; }
    setIsVoting(true);
    castVote.mutate(undefined, {
      onSuccess: (res) => {
        setIsVoting(false);
        queryClient.invalidateQueries({ queryKey: ["getVoteStats"] });
        toast({ title: "Vote cast!", description: `Total votes: ${res.totalVotes}` });
      },
      onError: (err: any) => {
        setIsVoting(false);
        toast({ variant: "destructive", title: "Couldn't vote", description: err.message || "You may have already voted today." });
      }
    });
  };

  const handleLike = (postId: number, isLiked: boolean) => {
    if (!user) { setLocation("/login"); return; }
    if (isLiked) {
      unlikePost.mutate({ postId }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getFeed"] }),
      });
    } else {
      likePost.mutate({ postId }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getFeed"] }),
      });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary fill-primary" size={20} />
          <span className="font-bold text-lg text-primary-foreground tracking-tight">Ai Pop</span>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <div className="bg-card border border-card-border rounded-[2rem] p-5 shadow-sm relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl -z-10"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative shrink-0 cursor-pointer" onClick={() => setLocation("/ai")}>
                <div className="w-16 h-16 rounded-full border-2 border-white shadow-sm overflow-hidden bg-muted">
                  <img src="/ai-avatar.png" alt="Ai" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
                  <BlueBadge size={16} />
                </div>
              </div>
              <div className="flex-1 cursor-pointer" onClick={() => setLocation("/ai")}>
                <h2 className="font-bold text-lg text-foreground flex items-center gap-1">
                  Ai <Sparkles size={14} className="text-primary fill-primary" />
                </h2>
                <p className="text-xs text-muted-foreground">Support my idol journey!</p>
              </div>
              <Button
                onClick={handleVote}
                disabled={castVote.isPending}
                className={cn("rounded-full h-10 px-4 shadow-sm transition-all duration-300", isVoting ? "scale-95 bg-primary/80" : "hover:scale-105")}
              >
                <Heart className={cn("mr-1 fill-current", isVoting && "animate-ping")} size={16} />
                Cheer
              </Button>
            </div>
            {isLoadingStats ? <Skeleton className="h-4 w-full rounded-full" /> : <VoteMeter stats={voteStats} showLabel={false} />}
          </div>
        </div>

        <div className="px-4 space-y-4 pb-4">
          {isLoadingFeed ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-card border border-card-border rounded-[1.5rem] p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></div>
                </div>
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ))
          ) : feedData?.posts.length === 0 ? (
            <div className="bg-card border border-card-border rounded-[1.5rem] p-8 text-center text-muted-foreground">
              <p>No posts yet. Be the first to post!</p>
            </div>
          ) : (
            feedData?.posts.map((post) => (
              <div key={post.id} className="bg-card border border-card-border rounded-[1.5rem] overflow-hidden shadow-sm">
                <div className="p-4 flex items-center justify-between border-b border-border/40">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setLocation(post.author?.username === 'aipopgirl' ? '/ai' : `/u/${post.author?.username}`)}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      {post.author?.avatarUrl ? (
                        <img src={post.author.avatarUrl} alt={post.author.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-bold">
                          {post.author?.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-foreground">{post.author?.name}</span>
                        {post.author?.isVerified && <BlueBadge size={14} />}
                      </div>
                      <span className="text-xs text-muted-foreground">@{post.author?.username}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full h-8 w-8">
                    <MoreHorizontal size={18} />
                  </Button>
                </div>

                <div className="cursor-pointer" onClick={() => setLocation(`/post/${post.id}`)}>
                  {post.mediaUrl && (
                    <div className="aspect-square bg-muted relative">
                      <img src={post.mediaUrl} alt="Post content" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-sm text-foreground mb-3 cursor-pointer" onClick={() => setLocation(`/post/${post.id}`)}>{post.caption}</p>
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post.id, !!post.isLiked)}
                      className={cn("flex items-center gap-1.5 transition-colors group", post.isLiked ? "text-accent-foreground" : "text-muted-foreground hover:text-accent-foreground")}
                    >
                      <div className={cn("p-1.5 rounded-full group-hover:bg-accent/20 transition-colors", post.isLiked && "bg-accent/10")}>
                        <Heart size={20} className={cn(post.isLiked && "fill-current")} />
                      </div>
                      <span className="text-xs font-bold">{post.likesCount}</span>
                    </button>
                    <button
                      onClick={() => setLocation(`/post/${post.id}`)}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group"
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                        <MessageCircle size={20} />
                      </div>
                      <span className="text-xs font-bold">{post.commentsCount}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-muted-foreground hover:text-green-500 transition-colors group">
                      <div className="p-1.5 rounded-full group-hover:bg-green-500/10 transition-colors">
                        <Share2 size={20} />
                      </div>
                      <span className="text-xs font-bold">{post.sharesCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
