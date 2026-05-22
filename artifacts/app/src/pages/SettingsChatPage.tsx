import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateChatSettings } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { ChatSettingsUpdateWhoCanMessageMe } from "@workspace/api-client-react/src/generated/api.schemas";

export default function SettingsChatPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const updateSettings = useUpdateChatSettings();

  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [whoCanMessageMe, setWhoCanMessageMe] = useState<ChatSettingsUpdateWhoCanMessageMe>("everyone");

  const handleSave = () => {
    updateSettings.mutate(
      { data: { readReceipts, typingIndicators, showOnlineStatus, whoCanMessageMe } },
      {
        onSuccess: () => toast({ title: "Chat settings saved" }),
        onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message }),
      }
    );
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/settings/account")}>
            <ArrowLeft size={20} />
          </Button>
          <span className="font-bold text-lg">Chat Settings</span>
        </div>
        <Button size="sm" className="rounded-full font-bold px-4" onClick={handleSave} disabled={updateSettings.isPending}>
          Save
        </Button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden divide-y divide-border/50">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">Read Receipts</p>
              <p className="text-xs text-muted-foreground">Let others know when you read their messages</p>
            </div>
            <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">Typing Indicators</p>
              <p className="text-xs text-muted-foreground">Show when you are typing</p>
            </div>
            <Switch checked={typingIndicators} onCheckedChange={setTypingIndicators} />
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">Online Status</p>
              <p className="text-xs text-muted-foreground">Show when you are online</p>
            </div>
            <Switch checked={showOnlineStatus} onCheckedChange={setShowOnlineStatus} />
          </div>
          <div className="p-4 space-y-2">
            <p className="font-bold text-sm">Who can message me</p>
            <Select value={whoCanMessageMe} onValueChange={(v: any) => setWhoCanMessageMe(v)}>
              <SelectTrigger className="w-full bg-muted border-none rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="followers">Followers only</SelectItem>
                <SelectItem value="none">No one</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button variant="outline" className="w-full justify-start h-14 rounded-2xl" onClick={() => setLocation("/settings/chat-backup")}>
          <Save className="mr-3 text-primary" size={20} />
          Chat Backup
        </Button>
      </main>
    </div>
  );
}
