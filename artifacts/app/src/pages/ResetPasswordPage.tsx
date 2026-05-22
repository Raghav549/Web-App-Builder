import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useResetPassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const resetPassword = useResetPassword();
  const [token, setToken] = useState("");

  useEffect(() => {
    // Extract token from query params (e.g. ?token=123)
    const urlParams = new URLSearchParams(window.location.search);
    const t = urlParams.get("token");
    if (t) setToken(t);
  }, [location]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function onSubmit(data: FormValues) {
    if (!token) {
      toast({ variant: "destructive", title: "Error", description: "Reset token missing." });
      return;
    }
    
    resetPassword.mutate(
      { data: { token, password: data.password } },
      {
        onSuccess: () => {
          toast({
            title: "Password Reset",
            description: "Your password has been successfully reset.",
          });
          setLocation("/login");
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: err.message || "Failed to reset password.",
          });
        },
      }
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="p-4 flex items-center">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setLocation("/login")}>
          <ArrowLeft size={20} />
        </Button>
      </header>

      <main className="flex-1 flex flex-col justify-center px-6 pb-20 max-w-md w-full mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-4">
            <Sparkles size={32} className="fill-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-center">New Password</h1>
          <p className="text-muted-foreground text-center text-sm mt-2">
            Create a new password for your account.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-bold">New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="bg-card border-input h-12 rounded-xl" {...field} />
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
                  <FormLabel className="text-foreground font-bold">Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="bg-card border-input h-12 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full h-14 rounded-full font-bold text-base shadow-lg shadow-primary/20 mt-4"
              disabled={resetPassword.isPending}
            >
              {resetPassword.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
