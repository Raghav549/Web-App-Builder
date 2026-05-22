import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateGroupConversation, useGetFollowers } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BlueBadge } from "@/components/ui/BlueBadge";
import { cn } from "@/lib/utils";

export default function CreateGroupPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: followersData, isLoading: isLoadingFollowers } = useGetFollowers(user?.id || 0, { query: { enabled: !!user?.id } });
  const createGroup = useCreateGroupConversation();
  
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      toast({ variant: "destructive", title: "Missing Name", description: "Please enter a group name." });
      return;
    }
    if (selectedIds.size === 0) {
      toast({ variant: "destructive", title: "No Members", description: "Select at least one member." });
      return;
    }
    
    createGroup.mutate(
      { data: { groupName, memberIds: Array.from(selectedIds) } },
      {
        onSuccess: (res) => {
          toast({ title: "Group Created!" });
          setLocation(`/messages/${res.id}`);
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err.message });
        }
      }
    );
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/messages")}>
            <ArrowLeft size={20} />
          </Button>
          <span className="font-bold text-lg">New Group</span>
        </div>
        <Button 
          size="sm" 
          className="rounded-full font-bold px-6"
          onClick={handleCreate}
          disabled={createGroup.isPending || !groupName.trim() || selectedIds.size === 0}
        >
          Create
        </Button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 pb-20">
        <div className="flex items-center gap-4 bg-card border border-card-border p-4 rounded-2xl">
          <button className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors shrink-0">
            <Camera size={20} />
          </button>
          <Input 
            placeholder="Group Name" 
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="border-none bg-transparent text-lg font-bold shadow-none px-0 h-auto placeholder:font-normal focus-visible:ring-0" 
          />
        </div>

        <div>
          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3 px-2">Select Members</h3>
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden divide-y divide-border/50">
            {isLoadingFollowers ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-3 flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))
            ) : followersData?.users.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                No followers available to add.
              </div>
            ) : followersData?.users.map((follower) => {
              const isSelected = selectedIds.has(follower.id);
              return (
                <div 
                  key={follower.id} 
                  className={cn("p-3 flex items-center justify-between cursor-pointer transition-colors", isSelected ? "bg-primary/5" : "hover:bg-muted/50")}
                  onClick={() => toggleSelect(follower.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                      {follower.avatarUrl ? (
                        <img src={follower.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-primary bg-primary/10">
                          {follower.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 font-bold text-sm">
                        {follower.name} {follower.isVerified && <BlueBadge size={14} />}
                      </div>
                      <p className="text-xs text-muted-foreground">@{follower.username}</p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                    isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                  )}>
                    {isSelected && <Check size={14} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
