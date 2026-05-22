import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Lock, Bell, MessageSquare, Shield, Activity, BarChart, HardDrive, Trash2, HelpCircle } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

export default function SettingsAccountPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/profile")}>
          <ArrowLeft size={20} />
        </Button>
        <span className="font-bold text-lg">Settings</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <div className="bg-card border border-card-border p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-muted overflow-hidden shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-primary bg-primary/10 text-xl">
                {user?.name?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">@{user?.username}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider px-2">Account</h3>
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden divide-y divide-border/50">
            <button className="w-full flex items-center p-4 hover:bg-muted/50 transition-colors" onClick={() => setLocation("/profile/edit")}>
              <User size={20} className="text-muted-foreground mr-3 shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">Personal Information</p>
              </div>
            </button>
            <button className="w-full flex items-center p-4 hover:bg-muted/50 transition-colors" onClick={() => setLocation("/settings/security")}>
              <Shield size={20} className="text-muted-foreground mr-3 shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">Password & Security</p>
              </div>
            </button>
          </div>

          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider px-2 mt-6">Preferences</h3>
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden divide-y divide-border/50">
            <button className="w-full flex items-center p-4 hover:bg-muted/50 transition-colors" onClick={() => setLocation("/settings/privacy")}>
              <Lock size={20} className="text-muted-foreground mr-3 shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">Privacy</p>
              </div>
            </button>
            <button className="w-full flex items-center p-4 hover:bg-muted/50 transition-colors" onClick={() => setLocation("/settings/notifications")}>
              <Bell size={20} className="text-muted-foreground mr-3 shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">Notifications</p>
              </div>
            </button>
            <button className="w-full flex items-center p-4 hover:bg-muted/50 transition-colors" onClick={() => setLocation("/settings/chat")}>
              <MessageSquare size={20} className="text-muted-foreground mr-3 shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">Chat Settings</p>
              </div>
            </button>
          </div>

          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider px-2 mt-6">Activity</h3>
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden divide-y divide-border/50">
            <button className="w-full flex items-center p-4 hover:bg-muted/50 transition-colors" onClick={() => setLocation("/settings/activity")}>
              <Activity size={20} className="text-muted-foreground mr-3 shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">Activity Log</p>
              </div>
            </button>
            <button className="w-full flex items-center p-4 hover:bg-muted/50 transition-colors" onClick={() => setLocation("/settings/posts-reach")}>
              <BarChart size={20} className="text-muted-foreground mr-3 shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">Posts Reach</p>
              </div>
            </button>
          </div>

          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider px-2 mt-6">Support & Data</h3>
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden divide-y divide-border/50">
            <button className="w-full flex items-center p-4 hover:bg-muted/50 transition-colors" onClick={() => setLocation("/settings/data")}>
              <HardDrive size={20} className="text-muted-foreground mr-3 shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">Download Data</p>
              </div>
            </button>
            <button className="w-full flex items-center p-4 hover:bg-muted/50 transition-colors" onClick={() => setLocation("/settings/help")}>
              <HelpCircle size={20} className="text-muted-foreground mr-3 shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">Help & Support</p>
              </div>
            </button>
          </div>

          <div className="pt-6">
            <button 
              className="w-full flex items-center p-4 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" 
              onClick={() => setLocation("/settings/account/delete")}
            >
              <Trash2 size={20} className="mr-3 shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">Delete Account</p>
              </div>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
