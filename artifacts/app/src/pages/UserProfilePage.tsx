import { useLocation, useParams } from "wouter";
import { useGetUserByUsername, useGetUserPosts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { BlueBadge } from "@/components/ui/BlueBadge";
import { ArrowLeft, MoreHorizontal, Grid } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/layout/BottomNav";

export default function UserProfilePage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const username = params.username as string;

  const { data: user, isLoading: isLoadingUser } = useGetUserByUsername(username);
  const { data: postsData, isLoading: isLoadingPosts } = useGetUserPosts(user?.id || 0, { query: { enabled: !!user?.id } });

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-32 w-full" />
        <div className="max-w-md mx-auto px-4 -mt-12">
          <Skeleton className="w-24 h-24 rounded-full border-4 border-background mb-4" />
          <Skeleton className="h-6 w-48 mb-2" />
        </div>
      </div>
    );
  }

  if (!user) return <div>User not found</div>;

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <span className="font-bold text-lg">{user.username}</span>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreHorizontal size={20} />
        </Button>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4">
        <div className="flex justify-between items-start mb-4">
          <div className="w-20 h-20 rounded-full border-2 border-muted overflow-hidden bg-muted relative">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex gap-4 text-center">
            <div className="flex flex-col">
              <span className="font-bold text-lg">{user.postsCount}</span>
              <span className="text-xs text-muted-foreground">Posts</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">{user.followersCount}</span>
              <span className="text-xs text-muted-foreground">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">{user.followingCount}</span>
              <span className="text-xs text-muted-foreground">Following</span>
            </div>
          </div>
        </div>

        <div className="space-y-1 mb-4">
          <h1 className="font-bold text-foreground flex items-center gap-1">
            {user.name}
            {user.isVerified && <BlueBadge size={16} />}
          </h1>
          <p className="text-sm text-foreground">{user.bio}</p>
        </div>

        <div className="flex gap-2 mb-6">
          <Button className="flex-1 rounded-xl font-bold bg-primary text-primary-foreground shadow-sm">
            Follow
          </Button>
          <Button variant="outline" className="flex-1 rounded-xl font-bold">
            Message
          </Button>
        </div>

        <div className="border-t">
          <div className="flex justify-center p-3 border-b-2 border-primary w-full">
            <Grid size={24} className="text-primary" />
          </div>
          
          <div className="grid grid-cols-3 gap-1 mt-1">
            {isLoadingPosts ? (
              Array(6).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)
            ) : postsData?.posts.map(post => (
              <div key={post.id} className="aspect-square bg-muted cursor-pointer" onClick={() => setLocation(`/post/${post.id}`)}>
                {post.mediaUrl && <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />}
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
