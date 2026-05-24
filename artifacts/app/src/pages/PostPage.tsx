import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useGetPost, useLikePost, useUnlikePost, useGetComments, useCreateComment, useFollowUser, useUnfollowUser } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BlueBadge } from "@/components/ui/BlueBadge";
import { ArrowLeft, Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Download, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function PostPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const postId = Number(params.id);
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: post, isLoading: isLoadingPost } = useGetPost(postId);
  const { data: commentsData, isLoading: isLoadingComments } = useGetComments(postId);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const createComment = useCreateComment();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const [commentText, setCommentText] = useState("");
  const [localLiked, setLocalLiked] = useState<boolean | null>(null);
  const [localLikeCount, setLocalLikeCount] = useState<number | null>(null);

  const isLiked = localLiked !== null ? localLiked : !!post?.isLiked;
  const likeCount = localLikeCount !== null ? localLikeCount : (post?.likesCount ?? 0);

  const toggleLike = () => {
    if (!me) { setLocation("/login"); return; }
    if (!post) return;
    if (isLiked) {
      setLocalLiked(false);
      setLocalLikeCount(likeCount - 1);
      unlikePost.mutate({ postId });
    } else {
      setLocalLiked(true);
      setLocalLikeCount(likeCount + 1);
      likePost.mutate({ postId });
    }
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!me) { setLocation("/login"); return; }
    createComment.mutate(
      { postId, data: { content: commentText } },
      {
        onSuccess: () => {
          setCommentText("");
          queryClient.invalidateQueries({ queryKey: ["getComments", postId] });
          queryClient.invalidateQueries({ queryKey: ["getPost", postId] });
        },
        onError: () => toast({ variant: "destructive", title: "Could not post comment" }),
      }
    );
  };

  const handleFollow = () => {
    if (!me) { setLocation("/login"); return; }
    if (!post?.author?.id) return;
    followUser.mutate({ userId: post.author.id }, {
      onSuccess: () => toast({ title: `Following ${post.author?.name}!` }),
    });
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
          {post.author?.id !== me?.id && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8 px-4 text-xs font-bold"
              onClick={handleFollow}
              disabled={followUser.isPending}
            >
              Follow
            </Button>
          )}
        </div>

        {post.mediaUrl && (
          <div className="aspect-square bg-muted relative w-full">
            <img src={post.mediaUrl} alt="Post content" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={toggleLike} className={cn("transition-colors", isLiked ? "text-accent-foreground" : "text-foreground hover:text-accent-foreground")}>
                <Heart size={24} className={cn(isLiked && "fill-current")} />
              </button>
              <button className="text-foreground hover:text-primary transition-colors">
                <MessageCircle size={24} />
              </button>
              <button className="text-foreground hover:text-green-500 transition-colors">
                <Share2 size={24} />
              </button>
            </div>
            <div className="flex items-center gap-4">
              {post.allowDownloads && (
                <button className="text-foreground hover:text-primary transition-colors">
                  <Download size={24} />
                </button>
              )}
              <button className="text-foreground hover:text-primary transition-colors">
                <Bookmark size={24} />
              </button>
            </div>
          </div>

          <div className="font-bold text-sm">{likeCount.toLocaleString()} likes</div>

          <div className="text-sm">
            <span className="font-bold mr-2">{post.author?.username}</span>
            <span>{post.caption}</span>
          </div>

          <div className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString()}
          </div>

          <div className="divider border-t my-4"></div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm">Comments ({commentsData?.total ?? post.commentsCount})</h4>

            {isLoadingComments ? (
              <Skeleton className="h-12 w-full" />
            ) : commentsData?.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
            ) : (
              commentsData?.comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted shrink-0 overflow-hidden">
                    {comment.author?.avatarUrl ? (
                      <img src={comment.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary text-xs font-bold">
                        {comment.author?.name?.charAt(0) || "U"}
                      </div>
                    )}
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
              ))
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 pb-safe">
        <form onSubmit={handleComment} className="max-w-md mx-auto flex gap-2 items-center">
          <div className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0">
            {me?.avatarUrl ? (
              <img src={me.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary text-xs font-bold">
                {me?.name?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="rounded-full bg-muted border-none flex-1"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full shrink-0"
            disabled={!commentText.trim() || createComment.isPending}
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
