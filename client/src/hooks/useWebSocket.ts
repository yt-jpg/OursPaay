import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function useWebSocket(userId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Authenticate the connection
      ws.send(JSON.stringify({
        type: 'auth',
        userId,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'chat_message':
            // Invalidate messages query to fetch new message
            if (data.message?.billingId) {
              queryClient.invalidateQueries({
                queryKey: ['/api/billings', data.message.billingId, 'messages']
              });
            }
            break;
            
          case 'notification':
            // Show toast notification
            toast({
              title: data.notification.title,
              description: data.notification.message,
            });
            
            // Invalidate notifications queries
            queryClient.invalidateQueries({
              queryKey: ['/api/notifications']
            });
            queryClient.invalidateQueries({
              queryKey: ['/api/notifications/unread-count']
            });
            break;
            
          case 'billing_update':
            // Invalidate billing queries
            queryClient.invalidateQueries({
              queryKey: ['/api/billings']
            });
            queryClient.invalidateQueries({
              queryKey: ['/api/billings/stats']
            });
            break;
            
          default:
            console.log('Unknown WebSocket message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [userId, toast, queryClient]);

  // Function to send chat message
  const sendChatMessage = (billingId: string, receiverId: string, content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        billingId,
        receiverId,
        content,
      }));
    }
  };

  return {
    isConnected,
    sendChatMessage,
  };
}
