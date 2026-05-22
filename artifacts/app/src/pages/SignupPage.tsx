import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { useSignup } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ArrowLeft } from "lucide-react";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { login: setAuthContext } = useAuth();
  const { toast } = useToast();
  
  const signup = useSignup();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  function onSubmit(data: SignupFormValues) {
    const { confirmPassword, terms, ...submitData } = data;
    
    signup.mutate(
      { data: submitData },
      {
        onSuccess: (res) => {
          setAuthContext(res.token, res.user);
          toast({
            title: "Account created!",
            description: "Welcome to the Ai Pop community.",
          });
          setLocation("/home");
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Signup failed",
            description: err.message || "Failed to create account. Please try again.",
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

      <main className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-md w-full mx-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-4 -rotate-12">
            <Sparkles size={32} className="fill-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-center">Join the Fan Club!</h1>
          <p className="text-muted-foreground text-center text-sm mt-2">
            Create an account to vote, post, and support Ai.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-bold">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Hikari" className="bg-card border-input h-12 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-bold">Username</FormLabel>
                  <FormControl>
                    <Input placeholder="hikari_fan" className="bg-card border-input h-12 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-bold">Password</FormLabel>
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

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium text-muted-foreground">
                      I agree to the terms and conditions and privacy policy.
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-14 rounded-full font-bold text-base shadow-lg shadow-primary/20 mt-2"
              disabled={signup.isPending}
            >
              {signup.isPending ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Log in
          </Link>
        </div>
      </main>
    </div>
  );
}
