import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ArrowLeft } from "lucide-react";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login: setAuthContext } = useAuth();
  const { toast } = useToast();
  
  const login = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  function onSubmit(data: LoginFormValues) {
    login.mutate(
      { data },
      {
        onSuccess: (res) => {
          setAuthContext(res.token, res.user);
          toast({
            title: "Welcome back!",
            description: "Successfully logged in.",
          });
          if (res.user.role === "creator") {
            setLocation("/creator");
          } else {
            setLocation("/home");
          }
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: err.message || "Invalid credentials. Please try again.",
          });
        },
      }
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="p-4 flex items-center">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setLocation("/")}>
          <ArrowLeft size={20} />
        </Button>
      </header>

      <main className="flex-1 flex flex-col justify-center px-6 pb-20 max-w-md w-full mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-4 rotate-12">
            <Sparkles size={32} className="fill-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-center">Welcome Back</h1>
          <p className="text-muted-foreground text-center text-sm mt-2">
            Log in to continue supporting Ai!
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-bold">Email or Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="aipopgirl@demo.com" 
                      className="bg-card border-input h-12 rounded-xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-bold flex justify-between">
                    Password
                    <Link href="/forgot-password" className="text-primary font-medium text-xs hover:underline">
                      Forgot?
                    </Link>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="bg-card border-input h-12 rounded-xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-14 rounded-full font-bold text-base shadow-lg shadow-primary/20 mt-4"
              disabled={login.isPending}
            >
              {login.isPending ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            Sign up
          </Link>
        </div>
      </main>
    </div>
  );
}
