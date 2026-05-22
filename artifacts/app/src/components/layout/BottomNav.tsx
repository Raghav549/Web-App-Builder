import { Link, useLocation } from "wouter";
import { Home, Search, PlusCircle, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: "/home" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: PlusCircle, label: "Studio", href: "/studio" },
    { icon: Bell, label: "Alerts", href: "/notifications" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-border pb-safe">
      <nav className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.startsWith(item.href) && (item.href !== "/profile" || location === "/profile");
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href} className="w-full h-full flex flex-col items-center justify-center gap-1 active-elevate no-default-active-elevate rounded-xl transition-colors">
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                isActive ? "bg-primary text-primary-foreground scale-110 shadow-md" : "text-muted-foreground hover:bg-muted"
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
