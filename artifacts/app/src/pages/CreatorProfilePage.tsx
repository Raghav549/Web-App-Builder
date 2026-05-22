import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useUpdateProfile } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3),
  bio: z.string().max(160).optional().nullable(),
  alternateBio: z.string().max(160).optional().nullable(),
  mixChannelId: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export default function CreatorProfilePage() {
  const [, setLocation] = useLocation();
  const { user, login } = useAuth();
  const { toast } = useToast();
  const updateProfile = useUpdateProfile();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
      alternateBio: user?.alternateBio || "",
      mixChannelId: user?.mixChannelId || "",
    },
  });

  function onSubmit(data: FormValues) {
    updateProfile.mutate(
      { data },
      {
        onSuccess: (res) => {
          // If we had the new user object, we'd update context
          toast({ title: "Profile updated!" });
          setLocation("/creator");
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err.message });
        },
      }
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/creator")}>
            <ArrowLeft size={20} />
          </Button>
          <span className="font-bold text-lg">Edit Profile</span>
        </div>
        <Button 
          size="sm" 
          className="rounded-full font-bold px-6 shadow-sm"
          onClick={form.handleSubmit(onSubmit)}
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? "Saving..." : "Save"}
        </Button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted overflow-hidden border-2 border-border">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-primary bg-primary/10">
                  {user?.name?.charAt(0) || "?"}
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md">
              <Camera size={16} />
            </button>
          </div>
          <div className="w-full h-32 rounded-2xl bg-muted relative overflow-hidden flex items-center justify-center border border-border mt-2">
             {user?.coverUrl ? (
                <img src={user.coverUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Camera size={24} />
                  <span className="text-xs font-bold">Add Cover Photo</span>
                </div>
              )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Name</FormLabel>
                  <FormControl>
                    <Input className="bg-card rounded-xl h-12" {...field} />
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
                  <FormLabel className="font-bold">Username</FormLabel>
                  <FormControl>
                    <Input className="bg-card rounded-xl h-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="bg-card rounded-xl resize-none h-20" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alternateBio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Alternate Bio (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="bg-card rounded-xl resize-none h-20" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mixChannelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">MixChannel ID</FormLabel>
                  <FormControl>
                    <Input className="bg-card rounded-xl h-12" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </main>

      <BottomNav />
    </div>
  );
}
