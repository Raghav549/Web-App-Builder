import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Star, ArrowRight, Activity, Users, Image as ImageIcon } from "lucide-react";
import { useGetVoteStats, useGetFeed } from "@workspace/api-client-react";
import { VoteMeter } from "@/components/shared/VoteMeter";
import { BlueBadge } from "@/components/ui/BlueBadge";
import { Skeleton } from "@/components/ui/skeleton";

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: voteStats, isLoading: isLoadingStats } = useGetVoteStats();
  const { data: feedData, isLoading: isLoadingFeed } = useGetFeed({ limit: 3 });

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary fill-primary" size={24} />
          <span className="font-bold text-lg text-primary-foreground tracking-tight">Ai Pop</span>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={user?.role === "creator" ? "/creator" : "/home"}>
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-md mx-auto px-4 pt-6 space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent rounded-[2rem] -z-10 blur-xl"></div>
          <div className="bg-card border border-card-border rounded-[2rem] p-6 shadow-xl shadow-primary/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/30 rounded-full blur-2xl -z-10 translate-x-10 -translate-y-10"></div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden relative bg-muted">
                  <img src="/ai-avatar.png" alt="Ai" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md">
                  <BlueBadge size={24} />
                </div>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-card-foreground flex items-center justify-center gap-2">
                  Ai <Sparkles size={16} className="text-primary fill-primary" />
                </h1>
                <p className="text-sm text-muted-foreground font-medium">@aipopgirl</p>
              </div>

              <p className="text-sm text-card-foreground/80 max-w-[280px]">
                Aiming for the top! Support my journey to becoming the next big pop idol. Every vote counts!
              </p>

              <div className="w-full bg-muted/30 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm font-bold text-foreground">
                  <span>Current Rank: #12</span>
                  <span className="text-primary flex items-center gap-1">
                    <Star size={14} className="fill-primary" /> Target: #1
                  </span>
                </div>
                
                {isLoadingStats ? (
                  <Skeleton className="h-4 w-full rounded-full" />
                ) : (
                  <VoteMeter stats={voteStats} />
                )}
              </div>

              <Button 
                size="lg" 
                className="w-full rounded-full bg-primary text-primary-foreground font-bold text-base h-14 shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform active:scale-[0.98]"
                onClick={() => setLocation(isAuthenticated ? "/ai/support" : "/login")}
              >
                <Heart className="mr-2 fill-current" size={20} />
                Cheer for Ai!
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-card-border rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <Users className="text-primary mb-2" size={20} />
            <span className="text-lg font-bold text-foreground">12.4k</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Followers</span>
          </div>
          <div className="bg-card border border-card-border rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <Heart className="text-accent-foreground mb-2" size={20} />
            <span className="text-lg font-bold text-foreground">842k</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Votes</span>
          </div>
          <div className="bg-card border border-card-border rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <ImageIcon className="text-[#60a5fa] mb-2" size={20} />
            <span className="text-lg font-bold text-foreground">142</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Posts</span>
          </div>
        </div>

        {/* Latest Updates */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Activity size={18} className="text-primary" /> Latest Updates
            </h2>
            <Button variant="link" size="sm" className="text-primary font-bold text-xs" onClick={() => setLocation("/ai")}>
              View All <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>

          <div className="space-y-4">
            {isLoadingFeed ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="bg-card border border-card-border rounded-[1.5rem] p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-48 w-full rounded-xl" />
                </div>
              ))
            ) : feedData?.posts.length === 0 ? (
              <div className="bg-card border border-card-border rounded-[1.5rem] p-8 text-center text-muted-foreground">
                <p>No posts yet.</p>
              </div>
            ) : (
              feedData?.posts.map((post) => (
                <div key={post.id} className="bg-card border border-card-border rounded-[1.5rem] overflow-hidden shadow-sm hover-elevate cursor-pointer" onClick={() => setLocation(`/post/${post.id}`)}>
                  <div className="p-4 flex items-center gap-3 border-b border-border/40">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      {post.author?.avatarUrl ? (
                        <img src={post.author.avatarUrl} alt={post.author.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-bold">
                          {post.author?.name?.charAt(0) || "A"}
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
                  
                  {post.mediaUrl && (
                    <div className="aspect-square bg-muted relative">
                      <img src={post.mediaUrl} alt="Post content" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="p-4 space-y-2">
                    <p className="text-sm text-foreground line-clamp-2">{post.caption}</p>
                    <div className="flex items-center gap-4 text-muted-foreground text-xs font-medium">
                      <span className="flex items-center gap-1"><Heart size={14} /> {post.likesCount}</span>
                      <span className="flex items-center gap-1">Comments: {post.commentsCount}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
