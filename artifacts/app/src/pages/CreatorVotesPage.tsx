import { useLocation } from "wouter";
import { useGetVoteAnalytics } from "@workspace/api-client-react";
import { ArrowLeft, Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/layout/BottomNav";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BlueBadge } from "@/components/ui/BlueBadge";

export default function CreatorVotesPage() {
  const [, setLocation] = useLocation();
  const { data: analytics, isLoading } = useGetVoteAnalytics();

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/creator")}>
          <ArrowLeft size={20} />
        </Button>
        <span className="font-bold text-lg">Vote Analytics</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <TrendingUp className="text-primary" size={20} /> Votes Over Time
              </h2>
              <div className="bg-card border border-card-border p-4 rounded-2xl h-64 shadow-sm">
                {analytics?.votesHistory && analytics.votesHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.votesHistory}>
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

            <div className="space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Heart className="text-accent-foreground" size={20} /> Recent Voters
              </h2>
              <div className="bg-card border border-card-border rounded-2xl overflow-hidden divide-y divide-border/50 shadow-sm">
                {analytics?.recentVoters?.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No recent votes.</div>
                ) : (
                  analytics?.recentVoters?.map((voter) => (
                    <div key={voter.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                          {voter.avatarUrl ? (
                            <img src={voter.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-primary bg-primary/10">
                              {voter.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm flex items-center gap-1">
                            {voter.name} {voter.isVerified && <BlueBadge size={14} />}
                          </p>
                          <p className="text-xs text-muted-foreground">@{voter.username}</p>
                        </div>
                      </div>
                      <div className="font-bold text-sm text-primary flex items-center gap-1">
                        +1 <Heart size={12} className="fill-current" />
                      </div>
                    </div>
                  ))
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
