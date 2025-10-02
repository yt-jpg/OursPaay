import { useState } from 'react';
import { useI18n } from '@/contexts/i18nContext';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Bell, 
  Globe, 
  Sun, 
  Moon, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Check,
  FileText,
  CreditCard,
  MessageCircle,
  Users,
  AlertTriangle,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
  onNotificationClick?: () => void;
}

const languages = [
  { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export default function Header({ className, onNotificationClick }: HeaderProps) {
  const { t, language, changeLanguage } = useI18n();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Global search functionality would be implemented here
    console.log('Search:', searchQuery);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const currentLanguage = languages.find(lang => lang.code === language);
  const unreadNotifications = notifications.filter((n: Notification) => !n.isRead);
  const notificationCount = unreadNotifications.length;

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

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <header className={cn("h-16 bg-card border-b border-border flex items-center justify-between px-6", className)}>
      <div className="flex items-center flex-1 gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('common.search') + ' cobranças, usuários, transações...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
            data-testid="global-search"
          />
        </form>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2" data-testid="language-selector">
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{currentLanguage?.flag}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={cn(
                  "flex items-center gap-2",
                  language === lang.code && "bg-accent"
                )}
                data-testid={`language-${lang.code}`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {language === lang.code && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          data-testid="theme-toggle"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative" 
              data-testid="notifications-trigger"
              onClick={() => onNotificationClick?.()}
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">{t('notifications.title')}</h3>
              {notificationCount > 0 && (
                <Badge variant="secondary">{notificationCount} novas</Badge>
              )}
            </div>
            <ScrollArea className="max-h-96">
              {notifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {unreadNotifications.slice(0, 5).map((notification: Notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const colorClass = getNotificationColor(notification.type);
                    
                    return (
                      <div
                        key={notification.id}
                        className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        data-testid={`notification-${notification.id}`}
                      >
                        <div className="flex gap-3">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-muted", colorClass)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-medium text-sm truncate text-foreground">
                                {notification.title}
                              </h4>
                              <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {notification.content}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {notification.type}
                              </Badge>
                              
                              {notification.data?.amount && (
                                <Badge variant="outline" className="text-xs">
                                  R$ {parseFloat(notification.data.amount).toLocaleString('pt-BR')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {notifications.length > 5 && (
                    <div className="p-4 text-center">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onNotificationClick?.()}
                        className="text-primary"
                      >
                        Ver todas as notificações
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-1">Nenhuma notificação</p>
                  <p className="text-sm">Suas notificações aparecerão aqui</p>
                </div>
              )}
            </ScrollArea>
            
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNotificationClick?.()}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Notificações
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2" data-testid="user-menu">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
                alt={user?.firstName || 'User'}
                className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
              />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.username
                }
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs capitalize">
                  {user?.role}
                </Badge>
                {user?.twoFactorEnabled && (
                  <Badge variant="outline" className="text-xs">
                    <Bot className="h-3 w-3 mr-1" />
                    2FA
                  </Badge>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="user-profile">
              <User className="mr-2 h-4 w-4" />
              <span>{t('settings.profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="user-settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('settings.title')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} data-testid="user-logout">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('auth.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
