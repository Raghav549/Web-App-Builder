import { useState } from "react";
import { useLocation } from "wouter";
import { useSearch, useGetTrending, getSearchQueryKey } from "@workspace/api-client-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Hash, Users, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BlueBadge } from "@/components/ui/BlueBadge";
import { SearchType } from "@workspace/api-client-react/src/generated/api.schemas";

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchType>("all");
  
  const { data: trendingData, isLoading: isLoadingTrending } = useGetTrending();
  const { data: searchResults, isLoading: isSearching } = useSearch(
    { q: query, type: activeTab },
    { query: { enabled: query.length > 1, queryKey: getSearchQueryKey({ q: query, type: activeTab }) } }
  );

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 p-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fans, posts, hashtags..." 
            className="pl-10 pr-10 rounded-full bg-muted border-none h-12"
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {!query ? (
          <div className="p-4 space-y-6">
            <div>
              <h2 className="font-bold text-lg mb-3">Trending Hashtags</h2>
              {isLoadingTrending ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {trendingData?.hashtags.map((tag, idx) => (
                    <Button 
                      key={idx} 
                      variant="secondary" 
                      className="rounded-full text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20"
                      onClick={() => setQuery(tag.tag)}
                    >
                      <Hash size={14} className="mr-1" />
                      {tag.tag}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-bold text-lg mb-3">Suggested for You</h2>
              <div className="space-y-3">
                <div className="bg-card border border-card-border p-3 rounded-2xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted overflow-hidden shrink-0">
                    <img src="/ai-avatar.png" alt="Ai" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 font-bold">
                      Ai <BlueBadge size={14} />
                    </div>
                    <p className="text-xs text-muted-foreground">@aipopgirl</p>
                  </div>
                  <Button size="sm" className="rounded-full px-4 font-bold shadow-sm" onClick={() => setLocation("/ai")}>
                    View
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SearchType)} className="w-full">
            <TabsList className="w-full flex bg-transparent border-b rounded-none h-auto p-0 overflow-x-auto scrollbar-hide">
              <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-3">Top</TabsTrigger>
              <TabsTrigger value="users" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-3">Users</TabsTrigger>
              <TabsTrigger value="posts" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-3">Posts</TabsTrigger>
              <TabsTrigger value="hashtags" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-3">Tags</TabsTrigger>
            </TabsList>
            
            <div className="p-4">
              {isSearching ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults ? (
                <div className="space-y-6">
                  {/* Users Results */}
                  {(activeTab === "all" || activeTab === "users") && searchResults.users && searchResults.users.length > 0 && (
                    <div className="space-y-3">
                      {activeTab === "all" && <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Users</h3>}
                      {searchResults.users.map(user => (
                        <div key={user.id} className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation(`/u/${user.username}`)}>
                          <div className="w-12 h-12 rounded-full bg-muted overflow-hidden shrink-0">
                            {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-primary bg-primary/10">{user.name.charAt(0)}</div>}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1 font-bold">
                              {user.name} {user.isVerified && <BlueBadge size={14} />}
                            </div>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {(!searchResults.users?.length && !searchResults.posts?.length && !searchResults.hashtags?.length) && (
                    <div className="text-center py-10 text-muted-foreground">
                      No results found for "{query}"
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </Tabs>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
