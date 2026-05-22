import { useLocation } from "wouter";
import { useGetCreatorPosts, useDeletePost, usePinPost, useUnpinPost } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Pin, Eye, Heart, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/layout/BottomNav";

export default function CreatorPostsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: postsData, isLoading, refetch } = useGetCreatorPosts();
  const deletePost = useDeletePost();
  const pinPost = usePinPost();
  const unpinPost = useUnpinPost();

  const handleDelete = (id: number) => {
    deletePost.mutate({ postId: id }, {
      onSuccess: () => {
        toast({ title: "Post deleted" });
        refetch();
      }
    });
  };

  const handlePin = (id: number, isPinned: boolean) => {
    if (isPinned) {
      unpinPost.mutate({ postId: id }, {
        onSuccess: () => {
          toast({ title: "Post unpinned" });
          refetch();
        }
      });
    } else {
      pinPost.mutate({ postId: id }, {
        onSuccess: () => {
          toast({ title: "Post pinned" });
          refetch();
        }
      });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/creator")}>
            <ArrowLeft size={20} />
          </Button>
          <span className="font-bold text-lg">Manage Posts</span>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : postsData?.posts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-dashed rounded-2xl">
            No posts found.
          </div>
        ) : (
          <div className="space-y-4">
            {postsData?.posts.map((post) => (
              <div key={post.id} className="bg-card border border-card-border p-4 rounded-2xl flex gap-4 shadow-sm">
                <div 
                  className="w-20 h-20 bg-muted rounded-xl shrink-0 overflow-hidden cursor-pointer"
                  onClick={() => setLocation(`/post/${post.id}`)}
                >
                  {post.mediaUrl && <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-sm line-clamp-2 pr-2">{post.caption || "No caption"}</p>
                      {post.isPinned && <Pin size={14} className="text-primary fill-primary shrink-0 mt-0.5" />}
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1"><Eye size={12} /> {post.viewsCount}</span>
                      <span className="flex items-center gap-1"><Heart size={12} /> {post.likesCount}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.commentsCount}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-end mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 rounded-full text-xs font-bold px-3"
                      onClick={() => handlePin(post.id, post.isPinned)}
                    >
                      {post.isPinned ? "Unpin" : "Pin"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 rounded-full text-xs font-bold text-destructive hover:bg-destructive/10 px-3"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 size={14} className="mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
