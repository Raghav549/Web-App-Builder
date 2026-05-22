import { useLocation } from "wouter";
import { useGetCreatorSupporters } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BlueBadge } from "@/components/ui/BlueBadge";
import { BottomNav } from "@/components/layout/BottomNav";

export default function CreatorSupportersPage() {
  const [, setLocation] = useLocation();
  const { data: supportersData, isLoading } = useGetCreatorSupporters();

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/creator")}>
          <ArrowLeft size={20} />
        </Button>
        <span className="font-bold text-lg">Top Supporters</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search supporters..." 
            className="pl-9 rounded-full bg-muted border-none h-10 text-sm"
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : supportersData?.supporters.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-dashed rounded-2xl">
            No supporters yet. Keep posting to engage your fans!
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden divide-y divide-border/50 shadow-sm">
            {supportersData?.supporters.map((supporter, idx) => (
              <div key={supporter.id} className="p-4 flex items-center gap-3">
                <div className="w-6 text-center font-bold text-sm text-muted-foreground">
                  {idx + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                  {supporter.avatarUrl ? (
                    <img src={supporter.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-primary bg-primary/10">
                      {supporter.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm">{supporter.name}</span>
                    {supporter.isVerified && <BlueBadge size={12} />}
                  </div>
                  <span className="text-xs text-muted-foreground">@{supporter.username}</span>
                </div>
                <div className="font-bold text-sm text-primary flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
                  {supporter.voteCount} <Heart size={12} className="fill-current" />
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
