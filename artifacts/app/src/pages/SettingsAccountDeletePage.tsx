import { useState } from "react";
import { useLocation } from "wouter";
import { useLogout } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsAccountDeletePage() {
  const [, setLocation] = useLocation();
  const { logout: contextLogout } = useAuth();
  const logout = useLogout();
  const { toast } = useToast();
  
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (confirmText !== "DELETE") return;
    setIsDeleting(true);
    
    // Simulate API call for deletion, then logout
    setTimeout(() => {
      logout.mutate(undefined, {
        onSettled: () => {
          contextLogout();
          toast({ title: "Account Deleted", description: "We're sorry to see you go!" });
          setLocation("/");
        }
      });
    }, 1500);
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/settings/account")}>
          <ArrowLeft size={20} />
        </Button>
        <span className="font-bold text-lg">Delete Account</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-2xl flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-destructive/20 text-destructive rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-destructive">This action is permanent!</h2>
            <p className="text-sm text-foreground mt-2">
              All your posts, votes, comments, and followers will be permanently removed. This cannot be undone.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="font-bold text-sm">Type "DELETE" to confirm</label>
            <Input 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="bg-card border-destructive/30 rounded-xl focus-visible:ring-destructive" 
              placeholder="DELETE"
            />
          </div>
          
          <Button 
            variant="destructive" 
            className="w-full h-12 rounded-full font-bold shadow-sm"
            disabled={confirmText !== "DELETE" || isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Permanently Delete Account"}
          </Button>
        </div>
      </main>
    </div>
  );
}
