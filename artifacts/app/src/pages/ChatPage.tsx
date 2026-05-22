import { useLocation, useParams } from "wouter";
import { useGetConversation, useGetMessages, useSendMessage, useMarkConversationSeen } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BlueBadge } from "@/components/ui/BlueBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";

export default function ChatPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const conversationId = Number(params.id);
  const { user } = useAuth();
  
  const { data: conversation, isLoading: isLoadingConvo } = useGetConversation(conversationId);
  const { data: messagesData, isLoading: isLoadingMsgs } = useGetMessages(conversationId);
  const sendMessage = useSendMessage();
  const markSeen = useMarkConversationSeen();
  
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      markSeen.mutate({ conversationId });
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    sendMessage.mutate(
      { conversationId, data: { content } },
      {
        onSuccess: () => setContent(""),
      }
    );
  };

  const otherUser = conversation?.participants?.find(p => p.id !== user?.id) || conversation?.participants?.[0];

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <header className="shrink-0 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => setLocation("/messages")}>
            <ArrowLeft size={20} />
          </Button>
          
          {isLoadingConvo ? (
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-24 h-4" />
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation(`/u/${otherUser?.username}`)}>
              <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                {otherUser?.avatarUrl ? (
                  <img src={otherUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-primary bg-primary/10">
                    {otherUser?.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1 font-bold text-sm leading-none">
                  {otherUser?.name} {otherUser?.isVerified && <BlueBadge size={12} />}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMsgs ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
              <Skeleton className="w-48 h-10 rounded-2xl" />
            </div>
          ))
        ) : (
          messagesData?.messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isMe 
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : "bg-muted text-foreground rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="shrink-0 bg-white border-t p-3 pb-safe">
        <form onSubmit={handleSend} className="max-w-md mx-auto flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground shrink-0">
            <ImageIcon size={20} />
          </Button>
          <Input 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Message..." 
            className="flex-1 rounded-full bg-muted border-none"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full shrink-0 shadow-sm"
            disabled={!content.trim() || sendMessage.isPending}
          >
            <Send size={18} className="mr-0.5 mt-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
