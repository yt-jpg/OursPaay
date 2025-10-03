import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  Home,
  FileText,
  DollarSign,
  CreditCard,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  Menu
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
  notificationCount?: number;
}

export function Sidebar({ 
  collapsed, 
  mobileOpen, 
  onToggleCollapsed, 
  onCloseMobile, 
  notificationCount = 0 
}: SidebarProps) {
  const { user } = useAuth() as { user: any };

  const sidebarClasses = `
    sidebar-expanded transition-width fixed top-0 left-0 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-40 shadow-2xl
    ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}
    ${mobileOpen ? 'sidebar-mobile-open' : ''}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/50">
                OP
              </div>
              <span className="font-bold text-xl sidebar-text bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">OursPay</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapsed}
              className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors hidden lg:flex"
              data-testid="button-toggle-sidebar"
            >
              <Menu className="w-5 h-5 text-sidebar-foreground" />
            </Button>
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseMobile}
              className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors lg:hidden"
              data-testid="button-close-mobile-sidebar"
            >
              <Menu className="w-5 h-5 text-sidebar-foreground" />
            </Button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <a 
              href="/" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/70 transition-all"
              data-testid="link-dashboard"
            >
              <Home className="w-5 h-5" />
              <span className="sidebar-text">Dashboard</span>
            </a>
            
            <a 
              href="#billings" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium"
              data-testid="link-billings"
            >
              <FileText className="w-5 h-5" />
              <span className="sidebar-text">Minhas Cobranças</span>
            </a>
            
            <a 
              href="#debts" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-medium"
              data-testid="link-debts"
            >
              <DollarSign className="w-5 h-5" />
              <span className="sidebar-text">Minhas Dívidas</span>
            </a>
            
            <a 
              href="#wallet" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-400 transition-all font-medium"
              data-testid="link-wallet"
            >
              <CreditCard className="w-5 h-5" />
              <span className="sidebar-text">Carteira</span>
            </a>
            
            <a 
              href="#messages" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400 transition-all font-medium"
              data-testid="link-messages"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="sidebar-text">Mensagens</span>
              {notificationCount > 0 && (
                <Badge className="ml-auto bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs px-2.5 py-1 rounded-full sidebar-text shadow-lg">
                  {notificationCount}
                </Badge>
              )}
            </a>
            
            <a 
              href="#notifications" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium"
              data-testid="link-notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="sidebar-text">Notificações</span>
            </a>
            
            <div className="border-t border-slate-200 dark:border-slate-800 my-4"></div>
            
            <a 
              href="#settings" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all font-medium"
              data-testid="link-settings"
            >
              <Settings className="w-5 h-5" />
              <span className="sidebar-text">Configurações</span>
            </a>

            {/* Admin Link - only show for admin users */}
            {user?.role === 'admin' && (
              <a 
                href="/admin" 
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold shadow-lg shadow-rose-500/50 hover:shadow-xl hover:shadow-rose-500/70 transition-all"
                data-testid="link-admin"
              >
                <Settings className="w-5 h-5" />
                <span className="sidebar-text">Painel Admin</span>
              </a>
            )}
          </nav>
          
          {/* User Profile */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <img
                src={user?.profileImageUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                alt="User avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-sidebar-border"
                data-testid="img-avatar"
              />
              <div className="flex-1 sidebar-text">
                <p className="font-medium text-sm text-sidebar-foreground" data-testid="text-username">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-email">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.href = '/api/logout'}
                className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors sidebar-text"
                title="Fazer logout"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 text-sidebar-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
