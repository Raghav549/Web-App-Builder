import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DownloadCloud, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsDataPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleRequest = () => {
    toast({ title: "Request Submitted", description: "You will receive an email when your data is ready." });
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/settings/account")}>
          <ArrowLeft size={20} />
        </Button>
        <span className="font-bold text-lg">Download Data</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <div className="bg-card border border-card-border p-6 rounded-2xl flex flex-col items-center text-center gap-4 shadow-sm">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
            <DownloadCloud size={40} />
          </div>
          <div>
            <h2 className="font-bold text-lg">Request Your Data</h2>
            <p className="text-sm text-muted-foreground mt-2">
              We'll create a file with your profile, posts, messages, and voting history. It may take up to 48 hours.
            </p>
          </div>
          <Button className="w-full h-12 rounded-full font-bold shadow-sm" onClick={handleRequest}>
            Request Download
          </Button>
        </div>

        <div className="space-y-3 pt-4">
          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider px-2">What's Included</h3>
          <div className="bg-card border border-card-border rounded-2xl divide-y divide-border/50">
            <div className="p-4 flex items-center gap-3">
              <FileText size={18} className="text-muted-foreground shrink-0" />
              <p className="text-sm font-medium">Profile Information & Settings</p>
            </div>
            <div className="p-4 flex items-center gap-3">
              <FileText size={18} className="text-muted-foreground shrink-0" />
              <p className="text-sm font-medium">Posts, Media & Comments</p>
            </div>
            <div className="p-4 flex items-center gap-3">
              <FileText size={18} className="text-muted-foreground shrink-0" />
              <p className="text-sm font-medium">Chat History</p>
            </div>
            <div className="p-4 flex items-center gap-3">
              <FileText size={18} className="text-muted-foreground shrink-0" />
              <p className="text-sm font-medium">Voting & Support History</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
