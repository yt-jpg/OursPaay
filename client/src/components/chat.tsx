import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X, Send, Paperclip, User } from "lucide-react";

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  billingId?: string;
  otherUserId?: string;
}

export function Chat({ isOpen, onClose, billingId, otherUserId }: ChatProps) {
  const { user } = useAuth() as { user: any };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages for the specific billing
  const { data: messages } = useQuery({
    queryKey: ['/api/billings', billingId, 'messages'],
    enabled: !!billingId && isOpen,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!billingId || !otherUserId) {
        throw new Error("Missing billing ID or other user ID");
      }
      await apiRequest('POST', `/api/billings/${billingId}/messages`, {
        content,
        receiverId: otherUserId,
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/billings', billingId, 'messages'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50" data-testid="chat-interface">
      <Card className="w-96 max-h-[600px] flex flex-col shadow-2xl">
        {/* Chat Header */}
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-primary rounded-full"></div>
            </div>
            <div>
              <p className="font-medium">Chat de Cobrança</p>
              <p className="text-xs opacity-90">Online</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/10"
            data-testid="button-close-chat"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        {/* Chat Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20 max-h-96">
          {messages?.length ? (
            messages.map((msg: any) => (
              <div key={msg.id} className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                <div className={`chat-bubble ${msg.senderId === user?.id ? 'chat-bubble-sent' : 'chat-bubble-received'}`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma mensagem ainda</p>
              <p className="text-xs mt-1">Inicie a conversa!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        
        {/* Chat Input */}
        <div className="p-4 border-t border-border bg-card rounded-b-lg">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-attach-file"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              disabled={sendMessageMutation.isPending}
              data-testid="input-chat-message"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-send-message"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
