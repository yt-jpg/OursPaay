import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/i18nContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Search,
  Paperclip,
  Send,
  Smile,
  Bot,
  User,
  Circle,
  MoreVertical,
  Info,
  Sparkles
} from 'lucide-react';

interface Message {
  id: string;
  conversationId: string;
  senderId?: string;
  senderType: 'user' | 'ai' | 'system';
  content: string;
  messageType: string;
  createdAt: string;
  readBy?: any;
}

interface Conversation {
  id: string;
  participantIds: string[];
  type: string;
  status: string;
  metadata?: any;
  lastMessage?: string;
  unreadCount?: number;
  updatedAt: string;
}

export default function ChatInterface() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/chat/conversations'],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['/api/chat/messages', selectedConversation],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: { conversationId: string; message: string; type?: string }) =>
      apiRequest('POST', `/api/chat/${data.type === 'ai' ? 'ai' : 'messages'}`, {
        conversationId: data.conversationId,
        message: data.message,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', selectedConversation] });
      setMessage('');
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Erro ao enviar mensagem',
        variant: 'destructive',
      });
    },
  });

  const { isConnected, sendMessage: sendWebSocketMessage } = useWebSocket({
    onMessage: (wsMessage) => {
      if (wsMessage.type === 'new_message') {
        queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
        queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    // Create AI conversation if none exists
    let conversationId = selectedConversation;
    if (selectedConversation === 'ai-new') {
      // Create new AI conversation
      try {
        const response = await apiRequest('POST', '/api/chat/conversations', {
          participantIds: [user?.id],
          type: 'user_ai',
        });
        const data = await response.json();
        conversationId = data.id;
        setSelectedConversation(conversationId);
      } catch (error) {
        toast({
          title: t('common.error'),
          description: 'Erro ao criar conversa',
          variant: 'destructive',
        });
        return;
      }
    }

    const isAIConversation = conversations.find((c: Conversation) => c.id === conversationId)?.type === 'user_ai' || selectedConversation === 'ai-new';

    sendMessageMutation.mutate({
      conversationId,
      message,
      type: isAIConversation ? 'ai' : 'user',
    });

    // Send typing indicator via WebSocket
    if (isConnected) {
      sendWebSocketMessage({
        type: 'chat_message',
        conversationId,
        content: message,
      });
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.type === 'user_ai') {
      return 'Assistente IA';
    }
    return conversation.metadata?.title || 'Conversa';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'user_ai') {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
          <Bot className="h-6 w-6 text-white" />
        </div>
      );
    }
    return (
      <img
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"
        alt="User"
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('chat.conversations')}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search') + ' conversas...'}
              className="pl-10"
              data-testid="search-conversations"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {/* AI Assistant Option */}
          <div
            className={`p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${
              selectedConversation === 'ai-new' ? 'bg-primary/5' : ''
            }`}
            onClick={() => setSelectedConversation('ai-new')}
            data-testid="ai-conversation"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-foreground truncate flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-warning" />
                    {t('chat.aiAssistant')}
                  </p>
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">Como posso ajudá-lo hoje?</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    <Bot className="h-3 w-3 mr-1" />
                    IA
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Conversations */}
          {conversations.map((conversation: Conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                selectedConversation === conversation.id ? 'bg-primary/5' : ''
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
              data-testid={`conversation-${conversation.id}`}
            >
              <div className="flex items-start gap-3">
                {getConversationAvatar(conversation)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-foreground truncate">
                      {getConversationTitle(conversation)}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatMessageTime(conversation.updatedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage || 'Nova conversa'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Circle className="w-2 h-2 fill-success text-success" />
                      <span className="text-xs text-muted-foreground">{t('chat.online')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <Button
            className="w-full"
            onClick={() => {
              toast({
                title: 'Em desenvolvimento',
                description: 'Nova conversa será implementada',
              });
            }}
            data-testid="new-conversation"
          >
            {t('chat.newConversation')}
          </Button>
        </div>
      </div>

      {/* Chat Content Area */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedConversation === 'ai-new' ? (
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-foreground">
                    {selectedConversation === 'ai-new' ? t('chat.aiAssistant') : 'Usuário'}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Circle className="w-2 h-2 fill-success text-success" />
                    {t('chat.online')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Info className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {selectedConversation === 'ai-new' && messages.length === 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-sm">
                          Olá! Como posso ajudar você hoje? Posso responder perguntas sobre cobranças, pagamentos ou sua carteira digital.
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Agora</p>
                    </div>
                  </div>
                )}

                {messages.map((msg: Message) => (
                  <div key={msg.id} className={`flex items-start gap-3 ${
                    msg.senderType === 'user' ? 'justify-end' : ''
                  }`}>
                    {msg.senderType !== 'user' && (
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        {msg.senderType === 'ai' ? (
                          <Bot className="h-5 w-5 text-primary" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    <div className={`flex-1 max-w-lg ${msg.senderType === 'user' ? 'text-right' : ''}`}>
                      <div className={`rounded-lg p-3 ${
                        msg.senderType === 'user'
                          ? 'bg-primary text-primary-foreground ml-12'
                          : 'bg-muted text-foreground'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatMessageTime(msg.createdAt)}
                      </p>
                    </div>
                    {msg.senderType === 'user' && (
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"
                        alt="User"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <Button type="button" variant="ghost" size="sm" data-testid="attach-file">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('chat.sendMessage')}
                    disabled={sendMessageMutation.isPending}
                    data-testid="message-input"
                  />
                </div>
                <Button type="button" variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  data-testid="send-message"
                >
                  {sendMessageMutation.isPending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>

              {/* AI Quick Replies */}
              {(selectedConversation === 'ai-new' || 
                conversations.find((c: Conversation) => c.id === selectedConversation)?.type === 'user_ai') && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    'Como posso criar uma nova cobrança?',
                    'Quais métodos de pagamento estão disponíveis?',
                    'Como funciona o programa de indicações?',
                    'Preciso falar com um atendente',
                  ].map((quickReply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setMessage(quickReply)}
                      className="text-xs"
                      data-testid={`quick-reply-${index}`}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {quickReply}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
              <p className="text-muted-foreground">Escolha uma conversa existente ou inicie um chat com a IA</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
