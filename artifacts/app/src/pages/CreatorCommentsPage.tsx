import { useLocation } from "wouter";
import { useGetCreatorComments, useDeleteComment } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/layout/BottomNav";

export default function CreatorCommentsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: commentsData, isLoading, refetch } = useGetCreatorComments();
  const deleteComment = useDeleteComment();

  const handleDelete = (postId: number, commentId: number) => {
    deleteComment.mutate({ postId, commentId }, {
      onSuccess: () => {
        toast({ title: "Comment deleted" });
        refetch();
      }
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/creator")}>
            <ArrowLeft size={20} />
          </Button>
          <span className="font-bold text-lg">Manage Comments</span>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : commentsData?.comments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center border border-dashed rounded-2xl">
            <MessageCircle size={32} className="mb-2 text-muted-foreground/50" />
            <p>No comments on your posts yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {commentsData?.comments.map((comment) => (
              <div key={comment.id} className="bg-card border border-card-border p-4 rounded-2xl flex gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                  {comment.author?.avatarUrl && <img src={comment.author.avatarUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm truncate">{comment.author?.username}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-2">{comment.content}</p>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs rounded-full px-3">
                      Reply
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs rounded-full text-destructive hover:bg-destructive/10 border-destructive/20 px-3"
                      onClick={() => handleDelete(comment.postId, comment.id)}
                    >
                      <Trash2 size={12} className="mr-1" /> Delete
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
