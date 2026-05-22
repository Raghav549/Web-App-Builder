import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUpdateGoal, useGetCreatorStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Target, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@workspace/api-client-react";

export default function CreatorSettingsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { logout: contextLogout } = useAuth();
  const logout = useLogout();
  
  const { data: stats } = useGetCreatorStats();
  const updateGoal = useUpdateGoal();

  const [goal, setGoal] = useState("");

  useEffect(() => {
    if (stats?.goalVotes) {
      setGoal(stats.goalVotes.toString());
    }
  }, [stats]);

  const handleSaveGoal = () => {
    const numGoal = parseInt(goal);
    if (isNaN(numGoal) || numGoal <= 0) {
      toast({ variant: "destructive", title: "Invalid goal", description: "Please enter a valid number." });
      return;
    }
    
    updateGoal.mutate(
      { data: { goalVotes: numGoal } },
      {
        onSuccess: () => toast({ title: "Goal updated!" }),
        onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message })
      }
    );
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        contextLogout();
        setLocation("/login");
      }
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/creator")}>
            <ArrowLeft size={20} />
          </Button>
          <span className="font-bold text-lg">Settings</span>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Target className="text-primary" size={20} /> Vote Goal
          </h3>
          <div className="bg-card border border-card-border p-4 rounded-2xl space-y-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Set a new target for your fans to aim for.</p>
            <div className="flex gap-2">
              <Input 
                type="number" 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="bg-muted border-none rounded-xl h-12 text-lg font-bold"
              />
              <Button 
                onClick={handleSaveGoal}
                disabled={updateGoal.isPending}
                className="h-12 rounded-xl font-bold px-6 shadow-sm"
              >
                Save Goal
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-6">
          <Button variant="outline" className="w-full justify-start h-14 rounded-2xl bg-card border-card-border shadow-sm" onClick={() => setLocation("/creator/profile")}>
            Edit Profile
          </Button>
          <Button variant="outline" className="w-full justify-start h-14 rounded-2xl bg-card border-card-border shadow-sm" onClick={() => setLocation("/settings/account")}>
            General Account Settings
          </Button>
        </div>

        <div className="pt-8">
          <Button 
            variant="ghost" 
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 justify-start h-12 rounded-xl font-bold"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-3" />
            Log Out
          </Button>
        </div>
      </main>
    </div>
  );
}
