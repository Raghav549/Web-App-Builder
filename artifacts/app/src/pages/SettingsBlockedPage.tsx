import { useLocation } from "wouter";
import { useGetBlockedUsers, useUnblockUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BlueBadge } from "@/components/ui/BlueBadge";

export default function SettingsBlockedPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: blockedUsers, isLoading } = useGetBlockedUsers();
  const unblock = useUnblockUser();

  const handleUnblock = (userId: number) => {
    unblock.mutate({ userId }, {
      onSuccess: () => toast({ title: "User unblocked" }),
      onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message })
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/settings/account")}>
          <ArrowLeft size={20} />
        </Button>
        <span className="font-bold text-lg">Blocked Users</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="w-20 h-8 rounded-full" />
              </div>
            ))}
          </div>
        ) : blockedUsers?.users.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground border border-dashed rounded-2xl">
            <ShieldAlert size={40} className="mb-4 text-muted-foreground/50" />
            <p className="font-bold text-foreground">No blocked users</p>
            <p className="text-sm mt-1">You haven't blocked anyone yet.</p>
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden divide-y divide-border/50">
            {blockedUsers?.users.map(user => (
              <div key={user.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted overflow-hidden shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-primary bg-primary/10">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm flex items-center gap-1">
                      {user.name} {user.isVerified && <BlueBadge size={14} />}
                    </p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-full"
                  onClick={() => handleUnblock(user.id)}
                  disabled={unblock.isPending}
                >
                  Unblock
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
