import { useState } from "react";
import { useLocation } from "wouter";
import { useGetConversations, useCreateConversation, useSearch, getSearchQueryKey } from "@workspace/api-client-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BlueBadge } from "@/components/ui/BlueBadge";
import { useToast } from "@/hooks/use-toast";

export default function MessagesListPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: convosData, isLoading } = useGetConversations();
  const createConversation = useCreateConversation();
  const [search, setSearch] = useState("");
  const [showNewDm, setShowNewDm] = useState(false);

  const searchParams = { q: search, type: "users" as any };
  const { data: searchResults } = useSearch(
    searchParams,
    { query: { enabled: search.length > 0, queryKey: getSearchQueryKey(searchParams) } }
  );

  const handleStartDm = (userId: number) => {
    createConversation.mutate({ data: { participantId: userId } }, {
      onSuccess: (conv) => {
        setShowNewDm(false);
        setSearch("");
        setLocation(`/messages/${conv.id}`);
      },
      onError: () => toast({ variant: "destructive", title: "Could not start conversation" }),
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-lg">Messages</span>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-muted hover:bg-primary/20 hover:text-primary transition-colors"
          onClick={() => setShowNewDm(!showNewDm)}
        >
          {showNewDm ? <X size={18} /> : <Edit size={18} />}
        </Button>
      </header>

      <main className="max-w-md mx-auto">
        {showNewDm ? (
          <div className="p-4 space-y-4">
            <p className="text-sm font-bold text-foreground">Start a new conversation</p>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search users..."
                className="pl-9 rounded-full bg-muted border-none h-10 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            {search.length === 0 && (
              <div
                className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-card-border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleStartDm(1)}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                  <img src="/ai-avatar.png" alt="Ai" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm">Ai</span>
                  <BlueBadge size={14} />
                </div>
              </div>
            )}
            {search.length > 0 && searchResults?.users?.map((u: any) => (
              <div
                key={u.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-card-border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleStartDm(u.id)}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-bold">
                      {u.name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm">{u.name}</span>
                    {u.isVerified && <BlueBadge size={14} />}
                  </div>
                  <span className="text-xs text-muted-foreground">@{u.username}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="p-4 pb-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search messages..."
                  className="pl-9 rounded-full bg-muted border-none h-10 text-sm"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="p-4 space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : convosData?.conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p className="font-bold text-foreground">No messages yet</p>
                <p className="text-sm mt-1">Start chatting with other fans!</p>
                <Button className="mt-4 rounded-full font-bold shadow-sm" onClick={() => setShowNewDm(true)}>
                  New Message
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {convosData?.conversations.map(convo => {
                  const otherUser = convo.participants?.find((p: any) => p.id !== convo.participants?.[0]?.id) || convo.participants?.[0];
                  return (
                    <div
                      key={convo.id}
                      className="p-4 flex gap-3 items-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setLocation(`/messages/${convo.id}`)}
                    >
                      <div className="w-14 h-14 rounded-full bg-muted overflow-hidden shrink-0">
                        {otherUser?.avatarUrl ? (
                          <img src={otherUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-lg text-primary bg-primary/10">
                            {otherUser?.name?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1 font-bold text-foreground truncate">
                            <span className="truncate">{convo.isGroup ? convo.groupName : otherUser?.name}</span>
                            {!convo.isGroup && otherUser?.isVerified && <BlueBadge size={14} />}
                          </div>
                          {convo.lastMessage && (
                            <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                              {new Date(convo.lastMessage.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className={`text-sm truncate ${convo.unreadCount ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                            {convo.lastMessage?.content || "Say hi!"}
                          </p>
                          {!!convo.unreadCount && (
                            <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0 ml-2">
                              {convo.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
