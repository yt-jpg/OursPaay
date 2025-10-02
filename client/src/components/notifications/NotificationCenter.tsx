import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useI18n } from '@/contexts/i18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Bell,
  X,
  Check,
  FileText,
  CreditCard,
  MessageCircle,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest('POST', `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: t('success.updated'),
        description: 'Todas as notificações foram marcadas como lidas',
      });
    },
  });

  // Handle real-time notifications
  useWebSocket({
    onMessage: (message) => {
      if (message.type === 'notification') {
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        
        // Show toast for new notifications
        toast({
          title: message.data.title,
          description: message.data.content,
        });
      }
    },
  });

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      'charge_created': FileText,
      'payment_received': CreditCard,
      'charge_overdue': AlertTriangle,
      'message': MessageCircle,
      'referral': Users,
      'contract': FileText,
    };
    
    const Icon = iconMap[type as keyof typeof iconMap] || Bell;
    return Icon;
  };

  const getNotificationColor = (type: string) => {
    const colorMap = {
      'charge_created': 'text-blue-500',
      'payment_received': 'text-green-500',
      'charge_overdue': 'text-red-500',
      'message': 'text-purple-500',
      'referral': 'text-orange-500',
      'contract': 'text-gray-500',
    };
    
    return colorMap[type as keyof typeof colorMap] || 'text-gray-500';
  };

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter((n: Notification) => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">{t('notifications.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 
              ? `${unreadCount} não lida${unreadCount !== 1 ? 's' : ''}`
              : 'Todas as notificações lidas'
            }
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-notifications">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            data-testid="filter-all"
          >
            Todas ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
            data-testid="filter-unread"
          >
            Não lidas ({unreadCount})
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="ml-auto"
              data-testid="mark-all-read"
            >
              <Check className="h-4 w-4 mr-2" />
              Marcar todas
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 p-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredNotifications.map((notification: Notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 cursor-pointer transition-colors relative",
                    !notification.isRead && "bg-primary/5"
                  )}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  data-testid={`notification-${notification.id}`}
                >
                  {!notification.isRead && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full"></div>
                  )}
                  
                  <div className="flex gap-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-muted", colorClass)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className={cn(
                          "font-medium text-sm truncate",
                          !notification.isRead ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {new Date(notification.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <p className={cn(
                        "text-sm leading-relaxed",
                        !notification.isRead ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {notification.content}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {t(`notifications.types.${notification.type}`) || notification.type}
                        </Badge>
                        
                        {notification.data?.amount && (
                          <Badge variant="outline" className="text-xs">
                            R$ {parseFloat(notification.data.amount).toLocaleString('pt-BR')}
                          </Badge>
                        )}
                        
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(notification.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h4 className="text-lg font-medium text-foreground mb-2">
              {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {filter === 'unread' 
                ? 'Todas as suas notificações foram lidas!'
                : 'Suas notificações aparecerão aqui.'
              }
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-2"
          onClick={() => {
            toast({
              title: 'Em desenvolvimento',
              description: 'Configurações de notificação serão implementadas',
            });
          }}
          data-testid="notification-settings"
        >
          <Settings className="h-4 w-4" />
          Configurar Notificações
        </Button>
      </div>
    </div>
  );
}
