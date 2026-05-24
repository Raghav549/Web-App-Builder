import { useLocation } from "wouter";
import { useGetUserByUsername, useGetVoteStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { BlueBadge } from "@/components/ui/BlueBadge";
import { VoteMeter } from "@/components/shared/VoteMeter";
import { ArrowLeft, Share2, MoreHorizontal, Heart, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/layout/BottomNav";

export default function AiProfilePage() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isLoadingUser } = useGetUserByUsername("aipopgirl");
  const { data: voteStats, isLoading: isLoadingStats } = useGetVoteStats();

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-48 w-full" />
        <div className="max-w-md mx-auto px-4 -mt-12">
          <Skeleton className="w-24 h-24 rounded-full border-4 border-background mb-4" />
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="fixed top-0 w-full z-50 bg-transparent flex justify-between p-4">
        <Button variant="secondary" size="icon" className="rounded-full bg-black/20 text-white backdrop-blur-md border-0" onClick={() => window.history.back()}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" size="icon" className="rounded-full bg-black/20 text-white backdrop-blur-md border-0">
            <Share2 size={20} />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full bg-black/20 text-white backdrop-blur-md border-0">
            <MoreHorizontal size={20} />
          </Button>
        </div>
      </header>

      {/* Cover Photo */}
      <div className="h-56 bg-muted relative">
        <img src="/ai-cover.png" alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-80"></div>
      </div>

      <main className="max-w-md mx-auto px-4 -mt-16 relative z-10">
        <div className="flex justify-between items-end mb-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-background shadow-lg overflow-hidden bg-muted">
              <img src="/ai-avatar.png" alt="Ai" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow-md">
              <BlueBadge size={20} />
            </div>
          </div>
          <div className="flex gap-2 mb-2">
            <Button size="icon" variant="outline" className="rounded-full border-primary/20 text-primary">
              <MessageCircle size={20} />
            </Button>
            <Button className="rounded-full px-6 bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20">
              Follow
            </Button>
          </div>
        </div>

        <div className="space-y-1 mb-4">
          <h1 className="text-2xl font-bold text-foreground">Ai</h1>
          <p className="text-sm text-muted-foreground font-medium">@aipopgirl • MixChannel ID: 18641424</p>
        </div>

        <p className="text-sm text-foreground mb-6">
          Aiming for the top! Support my journey to becoming the next big pop idol. Every vote counts! ✨💕
        </p>

        <div className="flex gap-6 mb-6 text-sm">
          <div className="flex flex-col">
            <span className="font-bold text-foreground">12.4k</span>
            <span className="text-muted-foreground">Followers</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">842k</span>
            <span className="text-muted-foreground">Votes</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">142</span>
            <span className="text-muted-foreground">Posts</span>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm">Goal Progress</h3>
            <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => setLocation("/ai/support")}>
              Support Ai
            </Button>
          </div>
          {isLoadingStats ? <Skeleton className="h-4 w-full rounded-full" /> : <VoteMeter stats={voteStats} />}
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-transparent border-b border-border/50 rounded-none h-auto p-0">
            <TabsTrigger value="posts" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2 pt-2 text-xs">Posts</TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2 pt-2 text-xs">About</TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2 pt-2 text-xs">Progress</TabsTrigger>
            <TabsTrigger value="supporters" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2 pt-2 text-xs">Fans</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6">
            <div className="grid grid-cols-3 gap-1">
              {Array(9).fill(0).map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-md overflow-hidden relative cursor-pointer" onClick={() => setLocation("/post/1")}>
                  <img src={`https://picsum.photos/seed/${i + 100}/200`} alt="Post" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="about" className="mt-6 p-4 bg-card rounded-2xl border border-card-border">
            <h3 className="font-bold mb-2">About Ai</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hello! I'm Ai, a 19-year-old aspiring pop idol from Tokyo. I love singing, dancing, and making people smile. 
              My dream is to perform at the Tokyo Dome!
            </p>
          </TabsContent>
          <TabsContent value="progress" className="mt-6 text-center text-muted-foreground p-8">
            Detailed progress charts coming soon!
          </TabsContent>
          <TabsContent value="supporters" className="mt-6 text-center text-muted-foreground p-8">
            Top supporters list coming soon!
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
