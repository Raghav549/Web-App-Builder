import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Cloud, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsChatBackupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleBackup = () => {
    toast({ title: "Backup Started", description: "Your chat backup is running in the background." });
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/settings/chat")}>
          <ArrowLeft size={20} />
        </Button>
        <span className="font-bold text-lg">Chat Backup</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <div className="flex flex-col items-center justify-center p-8 bg-card border border-card-border rounded-2xl text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <Cloud size={40} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Last Backup</h3>
            <p className="text-sm text-muted-foreground mt-1">Today at 2:00 AM</p>
            <p className="text-xs text-muted-foreground">Size: 45.2 MB</p>
          </div>
          <Button className="w-full rounded-full font-bold shadow-sm" onClick={handleBackup}>
            <UploadCloud className="mr-2" size={18} /> Back Up Now
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Backups are encrypted and stored securely.
        </div>
      </main>
    </div>
  );
}
