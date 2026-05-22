import { useLocation } from "wouter";
import { useGetPostsReach } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Heart, MessageCircle, Share2, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPostsReachPage() {
  const [, setLocation] = useLocation();
  const { data: reach, isLoading } = useGetPostsReach();

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/settings/account")}>
          <ArrowLeft size={20} />
        </Button>
        <span className="font-bold text-lg">Posts Reach</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
          </div>
        ) : (
          <>
            <div className="bg-primary text-primary-foreground p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -z-0 -translate-y-10 translate-x-10"></div>
              <div className="relative z-10">
                <p className="text-primary-foreground/80 font-medium mb-1">Total Views</p>
                <p className="text-4xl font-bold">{reach?.totalViews.toLocaleString()}</p>
                <p className="text-sm mt-2 opacity-90">Across all your posts</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-card-border p-4 rounded-2xl shadow-sm flex flex-col gap-2">
                <Heart size={20} className="text-accent" />
                <p className="font-bold text-2xl">{reach?.totalLikes.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground font-medium">Total Likes</p>
              </div>
              <div className="bg-card border border-card-border p-4 rounded-2xl shadow-sm flex flex-col gap-2">
                <MessageCircle size={20} className="text-blue-500" />
                <p className="font-bold text-2xl">{reach?.totalComments.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground font-medium">Comments</p>
              </div>
              <div className="bg-card border border-card-border p-4 rounded-2xl shadow-sm flex flex-col gap-2">
                <Share2 size={20} className="text-green-500" />
                <p className="font-bold text-2xl">{reach?.totalShares.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground font-medium">Shares</p>
              </div>
              <div className="bg-card border border-card-border p-4 rounded-2xl shadow-sm flex flex-col gap-2">
                <Download size={20} className="text-purple-500" />
                <p className="font-bold text-2xl">{reach?.totalDownloads.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground font-medium">Downloads</p>
              </div>
            </div>

            {reach?.bestPost && (
              <div className="space-y-3 pt-4">
                <h3 className="font-bold text-lg">Top Performing Post</h3>
                <div 
                  className="bg-card border border-card-border rounded-2xl p-3 flex gap-4 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setLocation(`/post/${reach.bestPost?.id}`)}
                >
                  <div className="w-20 h-20 bg-muted rounded-xl shrink-0 overflow-hidden">
                    {reach.bestPost.mediaUrl && <img src={reach.bestPost.mediaUrl} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 py-1">
                    <p className="text-sm font-bold line-clamp-1">{reach.bestPost.caption}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye size={12} /> {reach.bestPost.viewsCount}</span>
                      <span className="flex items-center gap-1"><Heart size={12} /> {reach.bestPost.likesCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
