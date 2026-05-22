import { useState } from "react";
import { useLocation } from "wouter";
import { useCreatePost } from "@workspace/api-client-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon, Video, X, ArrowLeft, Wand2, Megaphone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PostInputVisibility } from "@workspace/api-client-react/src/generated/api.schemas";

const FILTERS = [
  "Normal", "Soft Glow", "Cute Pop", "Warm Sunshine", "Pink Dream", 
  "Golden Smile", "Baseball Day", "Comedy Night", "Game Mode", 
  "Clean White", "Sweet Pastel", "Bright Cute", "Angel Wing", 
  "Heart Spark", "Tokyo Soft", "Natural Light", "Fresh Morning", 
  "Creamy Skin", "Pop Idol", "Gentle Blue", "Cheerful Yellow"
];

export default function CreatorStudioPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createPost = useCreatePost();

  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [filter, setFilter] = useState("Normal");
  const [visibility, setVisibility] = useState<PostInputVisibility>("public");
  const [allowComments, setAllowComments] = useState(true);
  const [isPinned, setIsPinned] = useState(false);

  const handleUpload = () => {
    setMediaUrl("https://picsum.photos/seed/studio2/800/800");
  };

  const handlePublish = () => {
    if (!mediaUrl && !caption) {
      toast({
        variant: "destructive",
        title: "Cannot publish",
        description: "Please add a photo or write a caption.",
      });
      return;
    }

    createPost.mutate(
      {
        data: {
          mediaUrl,
          caption,
          filterName: filter !== "Normal" ? filter : null,
          visibility,
          allowComments,
          mediaType: mediaUrl ? "image" : null,
          isPinned,
        }
      },
      {
        onSuccess: (post) => {
          toast({ title: "Published!" });
          setLocation(`/post/${post.id}`);
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Failed to publish", description: err.message });
        }
      }
    );
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/creator")}>
            <ArrowLeft size={20} />
          </Button>
          <span className="font-bold text-lg">Creator Studio</span>
        </div>
        <Button 
          size="sm" 
          className="rounded-full font-bold px-6 shadow-sm"
          onClick={handlePublish}
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Publishing..." : "Publish"}
        </Button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {mediaUrl ? (
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
              <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70 border-0"
                onClick={() => setMediaUrl(null)}
              >
                <X size={16} />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-primary font-bold">
                <Wand2 size={16} /> Filter
              </Label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filter === f 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button onClick={handleUpload} className="aspect-square rounded-3xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/5 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><ImageIcon size={24} /></div>
              <span className="font-bold text-sm">Photo</span>
            </button>
            <button onClick={handleUpload} className="aspect-square rounded-3xl border-2 border-dashed border-accent/30 flex flex-col items-center justify-center gap-2 text-accent hover:bg-accent/5 transition-colors">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center"><Video size={24} /></div>
              <span className="font-bold text-sm">Video</span>
            </button>
          </div>
        )}

        <div className="space-y-2">
          <Label className="font-bold">Caption</Label>
          <Textarea 
            placeholder="Write an announcement or update..." 
            className="resize-none h-24 bg-card border-input rounded-xl"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        <div className="space-y-4 bg-card border border-card-border p-4 rounded-2xl">
          <div className="space-y-2">
            <Label className="font-bold text-sm">Visibility</Label>
            <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
              <SelectTrigger className="w-full rounded-xl bg-muted border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Everyone</SelectItem>
                <SelectItem value="followers">Followers only</SelectItem>
                <SelectItem value="private">Only me</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="comments" className="flex flex-col cursor-pointer">
              <span className="font-bold">Allow Comments</span>
            </Label>
            <Switch id="comments" checked={allowComments} onCheckedChange={setAllowComments} />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Label htmlFor="pin" className="flex flex-col cursor-pointer">
              <span className="font-bold flex items-center gap-2 text-primary"><Megaphone size={16} /> Pin as Announcement</span>
              <span className="text-xs text-muted-foreground font-normal">Shows at the top of your profile</span>
            </Label>
            <Switch id="pin" checked={isPinned} onCheckedChange={setIsPinned} />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
