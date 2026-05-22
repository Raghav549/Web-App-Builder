import { useLocation } from "wouter";
import { useGetActivityLog } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsActivityPage() {
  const [, setLocation] = useLocation();
  const { data: activityData, isLoading } = useGetActivityLog();

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/settings/account")}>
          <ArrowLeft size={20} />
        </Button>
        <span className="font-bold text-lg">Activity Log</span>
      </header>

      <main className="max-w-md mx-auto p-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 items-start">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-2 flex-1 pt-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : activityData?.activities.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground border border-dashed rounded-2xl">
            <Clock size={40} className="mb-4 text-muted-foreground/50" />
            <p className="font-bold text-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activityData?.activities.map((activity) => (
              <div key={activity.id} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
