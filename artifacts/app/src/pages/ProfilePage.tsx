import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Heart, Award } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { BlueBadge } from "@/components/ui/BlueBadge";
import { useLogout, useGetUserByUsername, getGetUserByUsernameQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user: authUser, logout: contextLogout } = useAuth();
  const logout = useLogout();

  const { data: profile, isLoading } = useGetUserByUsername(authUser?.username || "", {
    query: { enabled: !!authUser?.username, queryKey: getGetUserByUsernameQueryKey(authUser?.username || "") }
  });

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        contextLogout();
        setLocation("/login");
      }
    });
  };

  if (!authUser) return null;

  const displayUser = profile || authUser;

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-lg flex items-center gap-1">
          {displayUser.username} {displayUser.isVerified && <BlueBadge size={16} />}
        </span>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setLocation("/settings/account")}>
          <Settings size={20} />
        </Button>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        <div className="flex justify-between items-start">
          <div className="w-20 h-20 rounded-full bg-muted overflow-hidden">
            {displayUser.avatarUrl ? (
              <img src={displayUser.avatarUrl} alt={displayUser.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-primary bg-primary/10">
                {displayUser.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex gap-4 text-center mt-2">
            <div className="flex flex-col">
              {isLoading ? <Skeleton className="h-6 w-8 mx-auto" /> : <span className="font-bold text-lg">{(profile as any)?.postsCount ?? 0}</span>}
              <span className="text-xs text-muted-foreground">Posts</span>
            </div>
            <div className="flex flex-col cursor-pointer" onClick={() => setLocation(`/u/${authUser.username}/followers`)}>
              {isLoading ? <Skeleton className="h-6 w-8 mx-auto" /> : <span className="font-bold text-lg">{(profile as any)?.followersCount ?? 0}</span>}
              <span className="text-xs text-muted-foreground">Followers</span>
            </div>
            <div className="flex flex-col cursor-pointer" onClick={() => setLocation(`/u/${authUser.username}/following`)}>
              {isLoading ? <Skeleton className="h-6 w-8 mx-auto" /> : <span className="font-bold text-lg">{(profile as any)?.followingCount ?? 0}</span>}
              <span className="text-xs text-muted-foreground">Following</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="font-bold text-lg">{displayUser.name}</h1>
          <p className="text-sm">{displayUser.bio || "No bio yet."}</p>
          <p className="text-xs text-muted-foreground pt-1">User ID: {displayUser.numericId}</p>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1 rounded-xl bg-muted text-foreground hover:bg-muted/80 shadow-none font-bold"
            onClick={() => setLocation("/profile/edit")}
          >
            Edit Profile
          </Button>
          <Button className="flex-1 rounded-xl bg-muted text-foreground hover:bg-muted/80 shadow-none font-bold">
            Share Profile
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <div className="bg-card border border-card-border p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Award size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">Supporter Rank</p>
              <p className="text-xs text-muted-foreground">
                {(profile as any)?.totalVotes ? `${(profile as any).totalVotes} votes cast` : "Unranked"}
              </p>
            </div>
          </div>
          <div className="bg-card border border-card-border p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
              <Heart size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">Total Votes</p>
              <p className="text-xs text-muted-foreground">{(profile as any)?.totalVotes ?? 0} cast</p>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <Button
            variant="ghost"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 justify-start h-12 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-3" />
            Log Out
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
