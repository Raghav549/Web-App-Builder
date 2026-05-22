import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetNotificationSettings, useUpdateNotificationSettings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsNotificationsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();

  const [localSettings, setLocalSettings] = useState<any>({});

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const toggleSetting = (key: string, value: boolean) => {
    setLocalSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSettings.mutate(
      { data: localSettings },
      {
        onSuccess: () => toast({ title: "Notifications updated" }),
        onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
      }
    );
  };

  if (isLoading) return <div className="p-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>;

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/settings/account")}>
            <ArrowLeft size={20} />
          </Button>
          <span className="font-bold text-lg">Notifications</span>
        </div>
        <Button size="sm" className="rounded-full font-bold px-4" onClick={handleSave} disabled={updateSettings.isPending}>
          Save
        </Button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden divide-y divide-border/50">
          {[
            { key: "votes", label: "Votes", desc: "When someone votes for you" },
            { key: "newFollowers", label: "New Followers", desc: "When someone follows you" },
            { key: "likes", label: "Likes", desc: "When someone likes your post" },
            { key: "comments", label: "Comments", desc: "When someone comments" },
            { key: "messages", label: "Messages", desc: "When you receive a message" },
            { key: "mentions", label: "Mentions", desc: "When you are mentioned" },
            { key: "aiNewPosts", label: "Ai's New Posts", desc: "When Ai posts something new" },
          ].map((item) => (
            <div key={item.key} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch 
                checked={!!localSettings[item.key]} 
                onCheckedChange={(v) => toggleSetting(item.key, v)} 
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
