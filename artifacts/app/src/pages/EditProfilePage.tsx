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
import { ArrowLeft, Camera, Link as LinkIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z.string().max(160, "Bio must be 160 characters or less").optional().nullable(),
  avatarUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function EditProfilePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateProfile = useUpdateProfile();
  const [showAvatarInput, setShowAvatarInput] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  function onSubmit(data: FormValues) {
    const payload: any = {
      name: data.name,
      username: data.username,
      bio: data.bio || null,
    };
    if (data.avatarUrl) payload.avatarUrl = data.avatarUrl;

    updateProfile.mutate(
      { data: payload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["getMe"] });
          queryClient.invalidateQueries({ queryKey: ["getUserByUsername", user?.username] });
          toast({ title: "Profile updated!" });
          setLocation("/profile");
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err.message || "Could not update profile" });
        },
      }
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/profile")}>
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

      <main className="max-w-md mx-auto p-4 space-y-6 pb-20">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-primary bg-primary/10">
                  {user?.name?.charAt(0) || "?"}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAvatarInput(!showAvatarInput)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md"
            >
              <Camera size={16} />
            </button>
          </div>
          {showAvatarInput && (
            <div className="w-full space-y-2">
              <p className="text-xs text-muted-foreground text-center">Paste an image URL for your profile picture</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <Input
                    placeholder="https://example.com/photo.jpg"
                    className="pl-8 rounded-xl bg-muted border-none text-sm"
                    value={form.watch("avatarUrl") || ""}
                    onChange={(e) => {
                      form.setValue("avatarUrl", e.target.value);
                      setAvatarPreview(e.target.value || null);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-xl shrink-0"
                  onClick={() => {
                    const url = form.getValues("avatarUrl");
                    setAvatarPreview(url || null);
                    setShowAvatarInput(false);
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Display Name</FormLabel>
                  <FormControl>
                    <Input className="bg-card rounded-xl h-12" placeholder="Your name" {...field} />
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
                    <Input className="bg-card rounded-xl h-12" placeholder="username" {...field} />
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
                  <FormLabel className="font-bold">Bio <span className="text-muted-foreground font-normal text-xs">({(field.value || "").length}/160)</span></FormLabel>
                  <FormControl>
                    <Textarea
                      className="bg-card rounded-xl resize-none h-24"
                      placeholder="Tell everyone about yourself..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </main>
    </div>
  );
}
