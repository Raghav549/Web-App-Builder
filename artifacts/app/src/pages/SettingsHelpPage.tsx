import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, MessageCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsHelpPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message sent!", description: "Our support team will get back to you soon." });
    setTimeout(() => setLocation("/settings/account"), 1500);
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/settings/account")}>
          <ArrowLeft size={20} />
        </Button>
        <span className="font-bold text-lg">Help & Support</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <a href="#" className="bg-card border border-card-border p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm hover:bg-muted/50 transition-colors">
            <Mail size={24} className="text-primary" />
            <span className="font-bold text-sm">Email Us</span>
          </a>
          <a href="#" className="bg-card border border-card-border p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm hover:bg-muted/50 transition-colors">
            <MessageCircle size={24} className="text-accent-foreground" />
            <span className="font-bold text-sm">Community FAQ</span>
          </a>
        </div>

        <div className="bg-card border border-card-border rounded-2xl overflow-hidden divide-y divide-border/50">
          <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <span className="font-bold text-sm">How voting works</span>
            <ExternalLink size={16} className="text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <span className="font-bold text-sm">Verification badges</span>
            <ExternalLink size={16} className="text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <span className="font-bold text-sm">Community Guidelines</span>
            <ExternalLink size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="pt-4 space-y-4">
          <h3 className="font-bold text-lg">Contact Support</h3>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <label className="font-bold text-sm">Subject</label>
              <Input placeholder="What do you need help with?" className="bg-muted border-none rounded-xl" required />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-sm">Message</label>
              <Textarea placeholder="Describe your issue..." className="bg-muted border-none rounded-xl resize-none h-32" required />
            </div>
            <Button type="submit" className="w-full h-12 rounded-full font-bold shadow-sm mt-2">
              Send Message
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
