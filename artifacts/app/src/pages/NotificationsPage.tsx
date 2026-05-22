import { useLocation } from "wouter";
import { useGetNotifications, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, UserPlus, MessageCircle, Star, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [, setLocation] = useLocation();
  const { data: notifsData, isLoading } = useGetNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="text-accent-foreground fill-accent-foreground" size={16} />;
      case 'follow': return <UserPlus className="text-primary" size={16} />;
      case 'comment': return <MessageCircle className="text-blue-500" size={16} />;
      case 'system': return <Star className="text-yellow-500 fill-yellow-500" size={16} />;
      default: return <Bell className="text-muted-foreground" size={16} />;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-lg">Notifications</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary font-bold text-xs"
          onClick={handleMarkAllRead}
          disabled={markAllRead.isPending || !notifsData?.unreadCount}
        >
          Mark all read
        </Button>
      </header>

      <main className="max-w-md mx-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 items-start">
                <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                <div className="space-y-2 flex-1 pt-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifsData?.notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Bell size={24} className="text-muted-foreground/50" />
            </div>
            <p className="font-bold text-foreground">All caught up!</p>
            <p className="text-sm">No new notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {notifsData?.notifications.map(notif => (
              <div 
                key={notif.id} 
                className={cn(
                  "p-4 flex gap-4 cursor-pointer hover:bg-muted/50 transition-colors",
                  !notif.isRead && "bg-primary/5"
                )}
                onClick={() => {
                  if (notif.relatedType === 'post' && notif.relatedId) {
                    setLocation(`/post/${notif.relatedId}`);
                  } else if (notif.actor?.username) {
                    setLocation(`/u/${notif.actor.username}`);
                  }
                }}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                    {notif.actor?.avatarUrl ? (
                      <img src={notif.actor.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-primary bg-primary/10">
                        {notif.actor?.name?.charAt(0) || "S"}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center shadow-sm border border-border">
                    {getIcon(notif.type)}
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-bold mr-1">{notif.actor?.name || "System"}</span>
                    {notif.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">{notif.body}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1 font-medium">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
