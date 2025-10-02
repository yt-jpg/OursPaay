import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/i18nContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Wallet,
  Users,
  MessageCircle,
  BarChart3,
  Settings,
  Shield,
  File,
  HelpCircle,
  ChevronLeft,
  Menu,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const navigationItems = [
  { id: 'dashboard', icon: LayoutDashboard, href: '/', requiresAuth: true },
  { id: 'charges', icon: FileText, href: '/charges', requiresAuth: true, badge: '12' },
  { id: 'payments', icon: CreditCard, href: '/payments', requiresAuth: true },
  { id: 'wallet', icon: Wallet, href: '/wallet', requiresAuth: true },
  { id: 'referrals', icon: Users, href: '/referrals', requiresAuth: true },
  { 
    type: 'divider',
    adminOnly: true
  },
  { id: 'users', icon: Users, href: '/admin/users', adminOnly: true },
  { id: 'reports', icon: BarChart3, href: '/admin/reports', adminOnly: true },
  { id: 'audit', icon: Shield, href: '/admin/audit', adminOnly: true },
  { id: 'contracts', icon: File, href: '/admin/contracts', adminOnly: true },
  { 
    type: 'divider'
  },
  { id: 'support', icon: MessageCircle, href: '/support', requiresAuth: true, status: 'active' },
  { id: 'settings', icon: Settings, href: '/settings', requiresAuth: true },
];

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsCollapsed(savedCollapsed);
  }, []);

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
    onToggle?.();
  };

  if (!isAuthenticated) {
    return null;
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-40 flex flex-col",
        isCollapsed ? "w-20" : "w-70"
      )}
      data-testid="sidebar"
    >
      {/* Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                OursPaay
              </h2>
              <p className="text-xs text-muted-foreground">Cobranças Pro</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="p-2"
          data-testid="sidebar-toggle"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navigationItems.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <li key={index} className="pt-4 pb-2">
                  <div className="border-t border-border" />
                  {item.adminOnly && !isCollapsed && (
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t('nav.administration')}
                    </div>
                  )}
                </li>
              );
            }

            // Skip admin-only items for non-admin users
            if (item.adminOnly && !isAdmin) {
              return null;
            }

            const Icon = item.icon!;
            const isActive = location === item.href;
            const hasNotification = item.status === 'active';

            return (
              <li key={item.id}>
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{t(`nav.${item.id}`)}</span>
                      {item.badge && (
                        <span className="bg-destructive/10 text-destructive text-xs font-semibold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {hasNotification && (
                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                      )}
                    </>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {t(`nav.${item.id}`)}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
            alt={user?.firstName || 'Usuário'} 
            className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" 
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.username
                }
              </p>
              <p className="text-xs text-muted-foreground truncate capitalize">
                {t(`roles.${user?.role}`)}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
