import { useLocation } from "wouter";
import { useGetCreatorStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, Users, Image as ImageIcon, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/layout/BottomNav";

export default function CreatorDashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = useGetCreatorStats();

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-lg text-primary">Creator Studio</span>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setLocation("/creator/settings")}>
          <Settings size={20} />
        </Button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-card-border p-4 rounded-2xl shadow-sm">
              <p className="text-sm text-muted-foreground font-medium mb-1">Total Votes</p>
              <p className="text-2xl font-bold text-foreground">{stats?.totalVotes.toLocaleString()}</p>
              <p className="text-xs text-primary font-bold mt-1">+{stats?.todayVotes} today</p>
            </div>
            <div className="bg-card border border-card-border p-4 rounded-2xl shadow-sm">
              <p className="text-sm text-muted-foreground font-medium mb-1">Profile Views</p>
              <p className="text-2xl font-bold text-foreground">{stats?.profileViews.toLocaleString()}</p>
            </div>
            <div className="bg-card border border-card-border p-4 rounded-2xl shadow-sm">
              <p className="text-sm text-muted-foreground font-medium mb-1">Post Views</p>
              <p className="text-2xl font-bold text-foreground">{stats?.postViews.toLocaleString()}</p>
            </div>
            <div className="bg-card border border-card-border p-4 rounded-2xl shadow-sm">
              <p className="text-sm text-muted-foreground font-medium mb-1">Engagement</p>
              <p className="text-2xl font-bold text-foreground">{(stats?.engagementRate || 0).toFixed(1)}%</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="font-bold text-lg">Management</h2>
          
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl justify-start font-bold text-base px-4 border-card-border bg-card shadow-sm hover:bg-muted"
            onClick={() => setLocation("/creator/analytics")}
          >
            <BarChart3 className="mr-3 text-primary" size={20} />
            Full Analytics
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl justify-start font-bold text-base px-4 border-card-border bg-card shadow-sm hover:bg-muted"
            onClick={() => setLocation("/creator/supporters")}
          >
            <Users className="mr-3 text-accent" size={20} />
            Top Supporters
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl justify-start font-bold text-base px-4 border-card-border bg-card shadow-sm hover:bg-muted"
            onClick={() => setLocation("/creator/posts")}
          >
            <ImageIcon className="mr-3 text-blue-500" size={20} />
            Manage Posts
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
