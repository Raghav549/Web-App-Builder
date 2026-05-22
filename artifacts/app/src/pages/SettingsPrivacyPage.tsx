import { useState } from "react";
import { useLocation } from "wouter";
import { useUpdatePrivacy } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  PrivacyUpdateWhoCanMessage, 
  PrivacyUpdateWhoCanComment, 
  PrivacyUpdateWhoCanViewFollowers, 
  PrivacyUpdateWhoCanDownload 
} from "@workspace/api-client-react/src/generated/api.schemas";

export default function SettingsPrivacyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const updatePrivacy = useUpdatePrivacy();

  const [isPrivate, setIsPrivate] = useState(false);
  const [whoCanMessage, setWhoCanMessage] = useState<PrivacyUpdateWhoCanMessage>("everyone");
  const [whoCanComment, setWhoCanComment] = useState<PrivacyUpdateWhoCanComment>("everyone");
  const [whoCanViewFollowers, setWhoCanViewFollowers] = useState<PrivacyUpdateWhoCanViewFollowers>("everyone");
  const [whoCanDownload, setWhoCanDownload] = useState<PrivacyUpdateWhoCanDownload>("everyone");

  const handleSave = () => {
    updatePrivacy.mutate(
      { data: { isPrivate, whoCanMessage, whoCanComment, whoCanViewFollowers, whoCanDownload } },
      {
        onSuccess: () => toast({ title: "Privacy settings updated" }),
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
          <span className="font-bold text-lg">Privacy</span>
        </div>
        <Button size="sm" className="rounded-full font-bold px-4" onClick={handleSave} disabled={updatePrivacy.isPending}>
          Save
        </Button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <div className="bg-card border border-card-border p-4 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Private Account</h3>
            <p className="text-xs text-muted-foreground mt-1">Only followers can see your posts.</p>
          </div>
          <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider px-2">Interactions</h3>
          
          <div className="bg-card border border-card-border p-4 rounded-2xl space-y-4">
            <div className="space-y-2">
              <label className="font-bold text-sm">Who can message you</label>
              <Select value={whoCanMessage} onValueChange={(v: any) => setWhoCanMessage(v)}>
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

            <div className="space-y-2">
              <label className="font-bold text-sm">Who can comment</label>
              <Select value={whoCanComment} onValueChange={(v: any) => setWhoCanComment(v)}>
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
            
            <div className="space-y-2">
              <label className="font-bold text-sm">Who can view followers</label>
              <Select value={whoCanViewFollowers} onValueChange={(v: any) => setWhoCanViewFollowers(v)}>
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
            
            <div className="space-y-2">
              <label className="font-bold text-sm">Who can download posts</label>
              <Select value={whoCanDownload} onValueChange={(v: any) => setWhoCanDownload(v)}>
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
        </div>
      </main>
    </div>
  );
}
