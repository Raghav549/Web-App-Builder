import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { useForgotPassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ArrowLeft } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const forgotPassword = useForgotPassword();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  function onSubmit(data: FormValues) {
    forgotPassword.mutate(
      { data },
      {
        onSuccess: () => {
          toast({
            title: "Email sent!",
            description: "Check your inbox for reset instructions.",
          });
          setLocation("/login");
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: err.message || "Failed to send reset email.",
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
          <h1 className="text-2xl font-bold text-foreground text-center">Reset Password</h1>
          <p className="text-muted-foreground text-center text-sm mt-2">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-bold">Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="hello@example.com" className="bg-card border-input h-12 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full h-14 rounded-full font-bold text-base shadow-lg shadow-primary/20 mt-4"
              disabled={forgotPassword.isPending}
            >
              {forgotPassword.isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
