import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useChangePassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield } from "lucide-react";

const schema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "Must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export default function SettingsSecurityPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const changePassword = useChangePassword();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" }
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    changePassword.mutate(
      { data: { currentPassword: data.currentPassword, newPassword: data.newPassword } },
      {
        onSuccess: () => {
          toast({ title: "Password changed successfully" });
          form.reset();
        },
        onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message })
      }
    );
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/settings/account")}>
          <ArrowLeft size={20} />
        </Button>
        <span className="font-bold text-lg">Password & Security</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        <div className="bg-card border border-card-border p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
            <Shield size={24} />
          </div>
          <div>
            <p className="font-bold text-sm">Account Security</p>
            <p className="text-xs text-muted-foreground">Keep your password strong and unique.</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="bg-muted border-none rounded-xl h-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="bg-muted border-none rounded-xl h-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="bg-muted border-none rounded-xl h-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full h-12 rounded-full font-bold mt-4 shadow-sm"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
