import { useLocation } from "wouter";
import { useGetCreatorAnalytics } from "@workspace/api-client-react";
import { ArrowLeft, BarChart3, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/layout/BottomNav";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function CreatorAnalyticsPage() {
  const [, setLocation] = useLocation();
  const { data: analytics, isLoading } = useGetCreatorAnalytics();

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/creator")}>
          <ArrowLeft size={20} />
        </Button>
        <span className="font-bold text-lg">Analytics</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Users className="text-primary" size={20} /> Follower Growth
              </h2>
              <div className="bg-card border border-card-border p-4 rounded-2xl h-64">
                {analytics?.followerGrowth && analytics.followerGrowth.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.followerGrowth}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="value" stroke="hsl(45 100% 55%)" strokeWidth={3} dot={{ r: 4, fill: 'hsl(45 100% 55%)', strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <BarChart3 className="text-accent-foreground" size={20} /> Profile Views
              </h2>
              <div className="bg-card border border-card-border p-4 rounded-2xl h-64">
                {analytics?.profileViewsHistory && analytics.profileViewsHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.profileViewsHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="value" stroke="hsl(340 80% 60%)" strokeWidth={3} dot={{ r: 4, fill: 'hsl(340 80% 60%)', strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
