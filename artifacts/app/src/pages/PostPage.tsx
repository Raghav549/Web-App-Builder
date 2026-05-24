import { useLocation, useParams } from "wouter";
import { useGetPost, useLikePost, useUnlikePost, useGetComments } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { BlueBadge } from "@/components/ui/BlueBadge";
import { ArrowLeft, Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function PostPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const postId = Number(params.id);
  
  const { data: post, isLoading: isLoadingPost } = useGetPost(postId);
  const { data: commentsData, isLoading: isLoadingComments } = useGetComments(postId);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();

  const toggleLike = () => {
    if (!post) return;
    if (post.isLiked) {
      unlikePost.mutate({ postId });
    } else {
      likePost.mutate({ postId });
    }
  };

  if (isLoadingPost) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="aspect-square w-full rounded-xl" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!post) return <div>Post not found</div>;

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => window.history.back()}>
            <ArrowLeft size={20} />
          </Button>
          <span className="font-bold text-lg">Post</span>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreHorizontal size={20} />
        </Button>
      </header>

      <main className="max-w-md mx-auto">
        <div className="p-4 flex items-center justify-between">
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
          <Button variant="outline" size="sm" className="rounded-full h-8 px-4 text-xs font-bold">
            Follow
          </Button>
        </div>

        {post.mediaUrl && (
          <div className="aspect-square bg-muted relative w-full">
            <img src={post.mediaUrl} alt="Post content" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={toggleLike} className={cn("transition-colors", post.isLiked ? "text-accent-foreground" : "text-foreground")}>
                <Heart size={24} className={cn(post.isLiked && "fill-current")} />
              </button>
              <button className="text-foreground">
                <MessageCircle size={24} />
              </button>
              <button className="text-foreground">
                <Share2 size={24} />
              </button>
            </div>
            <div className="flex items-center gap-4">
              {post.allowDownloads && (
                <button className="text-foreground">
                  <Download size={24} />
                </button>
              )}
              <button className="text-foreground">
                <Bookmark size={24} />
              </button>
            </div>
          </div>

          <div className="font-bold text-sm">
            {post.likesCount.toLocaleString()} likes
          </div>

          <div className="text-sm">
            <span className="font-bold mr-2">{post.author?.username}</span>
            <span>{post.caption}</span>
          </div>

          <div className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString()}
          </div>

          <div className="divider border-t my-4"></div>

          {/* Comments Section */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Comments ({post.commentsCount})</h4>
            
            {isLoadingComments ? (
              <Skeleton className="h-12 w-full" />
            ) : commentsData?.comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted shrink-0 overflow-hidden">
                  {comment.author?.avatarUrl && <img src={comment.author.avatarUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <div className="bg-muted/50 p-3 rounded-2xl rounded-tl-none">
                    <span className="font-bold text-xs mr-2">{comment.author?.username}</span>
                    <span className="text-sm">{comment.content}</span>
                  </div>
                  <div className="flex gap-4 mt-1 ml-2 text-[10px] text-muted-foreground font-bold">
                    <button>Reply</button>
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Comment Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 pb-safe">
        <div className="max-w-md mx-auto flex gap-2">
          <Input 
            placeholder="Add a comment..." 
            className="rounded-full bg-muted border-none"
          />
          <Button className="rounded-full" size="sm">Post</Button>
        </div>
      </div>
    </div>
  );
}
