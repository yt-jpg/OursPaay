import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Users,
  DollarSign,
  FileText,
  AlertTriangle,
  Search,
  Edit,
  UserX,
  Menu,
  Sun,
  Moon,
  Monitor,
  Shield,
  TrendingUp,
  Activity
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Admin() {
  const { user } = useAuth() as { user: any };
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersFilter, setUsersFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // WebSocket connection
  useWebSocket(user?.id);

  // Check if user is admin
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground mb-4">
              Você não tem permissão para acessar o painel administrativo.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch platform stats
  const { data: platformStats } = useQuery({
    queryKey: ['/api/admin/platform-stats'],
    enabled: !!user && user.role === 'admin',
  });

  // Fetch users list
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users', usersPage, usersFilter],
    enabled: !!user && user.role === 'admin',
  });

  // Fetch audit logs
  const { data: auditLogs } = useQuery({
    queryKey: ['/api/admin/audit-logs'],
    enabled: !!user && user.role === 'admin',
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      await apiRequest('PUT', `/api/admin/users/${userId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Usuário atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro ao atualizar usuário",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  const handleUserAction = (userId: string, action: 'block' | 'unblock' | 'ban') => {
    const actionData = {
      block: { isBlocked: true },
      unblock: { isBlocked: false },
      ban: { isActive: false, isBlocked: true },
    };

    updateUserMutation.mutate({
      userId,
      data: actionData[action],
    });
  };

  const getStatusBadge = (user: any) => {
    if (!user.isActive) {
      return <Badge className="status-overdue">Banido</Badge>;
    }
    if (user.isBlocked) {
      return <Badge className="status-cancelled">Bloqueado</Badge>;
    }
    return <Badge className="status-paid">Ativo</Badge>;
  };

  const getUserTypeBadge = (userType: string) => {
    const typeMap = {
      individual: { label: "PF", className: "status-pending" },
      business: { label: "PJ", className: "status-paid" },
    };
    
    const typeInfo = typeMap[userType as keyof typeof typeMap] || typeMap.individual;
    return <Badge className={typeInfo.className}>{typeInfo.label}</Badge>;
  };

  // Mock platform stats data since backend endpoint doesn't exist yet
  const mockPlatformStats = {
    totalUsers: usersData?.total || 1248,
    totalVolume: 2400000,
    activeBillings: 3842,
    pendingAlerts: 24,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className={`sidebar-expanded transition-width fixed top-0 left-0 h-full bg-card border-r border-border z-40 ${mobileSidebarOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-destructive to-warning rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                AD
              </div>
              <span className="font-bold text-xl sidebar-text">Admin Panel</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex"
              data-testid="button-toggle-sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive text-destructive-foreground font-medium">
              <Activity className="w-5 h-5" />
              <span className="sidebar-text">Visão Geral</span>
            </a>
            
            <a href="#users" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
              <Users className="w-5 h-5" />
              <span className="sidebar-text">Usuários</span>
              <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full sidebar-text">
                {mockPlatformStats.totalUsers}
              </span>
            </a>
            
            <a href="#billings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
              <FileText className="w-5 h-5" />
              <span className="sidebar-text">Cobranças</span>
            </a>
            
            <a href="#transactions" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
              <DollarSign className="w-5 h-5" />
              <span className="sidebar-text">Transações</span>
            </a>
            
            <a href="#audit" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
              <Shield className="w-5 h-5" />
              <span className="sidebar-text">Logs de Auditoria</span>
            </a>
            
            <div className="border-t border-border my-2"></div>
            
            <a href="#roles" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
              <Users className="w-5 h-5" />
              <span className="sidebar-text">Cargos & Permissões</span>
            </a>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => window.location.href = '/'}
            >
              <TrendingUp className="w-5 h-5 mr-3" />
              <span className="sidebar-text">Dashboard do Usuário</span>
            </Button>
          </nav>
          
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                alt="Admin avatar" 
                className="w-10 h-10 rounded-full object-cover border-2 border-border"
              />
              <div className="flex-1 sidebar-text">
                <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.href = '/api/logout'}
                className="sidebar-text"
                data-testid="button-logout"
              >
                <UserX className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className={`transition-width ${sidebarCollapsed ? 'main-content-collapsed' : 'main-content-expanded'}`}>
        {/* Top Bar */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                data-testid="button-mobile-menu"
              >
                <Menu className="w-6 h-6" />
              </Button>
              <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Theme Switcher */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`p-2 rounded-md ${theme === 'light' ? 'bg-background' : 'hover:bg-background/50'}`}
                  onClick={() => setTheme('light')}
                  title="Modo Claro"
                  data-testid="button-theme-light"
                >
                  <Sun className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`p-2 rounded-md ${theme === 'dark' ? 'bg-background' : 'hover:bg-background/50'}`}
                  onClick={() => setTheme('dark')}
                  title="Modo Escuro"
                  data-testid="button-theme-dark"
                >
                  <Moon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`p-2 rounded-md ${theme === 'high-contrast' ? 'bg-background' : 'hover:bg-background/50'}`}
                  onClick={() => setTheme('high-contrast')}
                  title="Alto Contraste"
                  data-testid="button-theme-contrast"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </div>
              
              <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-send-alert">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Enviar Alerta
              </Button>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1" data-testid="text-total-users">{mockPlatformStats.totalUsers}</h3>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-success" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1" data-testid="text-total-volume">
                  R$ {(mockPlatformStats.totalVolume / 1000000).toFixed(1)}M
                </h3>
                <p className="text-sm text-muted-foreground">Volume Total</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-warning" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1" data-testid="text-active-billings">{mockPlatformStats.activeBillings}</h3>
                <p className="text-sm text-muted-foreground">Cobranças Ativas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1" data-testid="text-pending-alerts">{mockPlatformStats.pendingAlerts}</h3>
                <p className="text-sm text-muted-foreground">Alertas Pendentes</p>
              </CardContent>
            </Card>
          </div>
          
          {/* User Management Table */}
          <Card id="users">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestão de Usuários</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuários..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      data-testid="input-search-users"
                    />
                  </div>
                  <Select value={usersFilter} onValueChange={setUsersFilter}>
                    <SelectTrigger className="w-40" data-testid="select-users-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="blocked">Bloqueado</SelectItem>
                      <SelectItem value="banned">Banido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Usuário</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Tipo</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Cadastro</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">2FA</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-muted-foreground">Carregando usuários...</span>
                          </div>
                        </td>
                      </tr>
                    ) : usersData?.users?.length ? (
                      usersData.users.map((user: any) => (
                        <tr key={user.id} className="hover:bg-accent/50 transition-colors" data-testid={`row-user-${user.id}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.profileImageUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50"}
                                alt="User"
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-medium" data-testid={`text-username-${user.id}`}>
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground" data-testid={`text-email-${user.id}`}>
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getUserTypeBadge(user.userType || 'individual')}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(user)}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4">
                            {user.twoFactorEnabled ? (
                              <div className="w-5 h-5 text-success" title="2FA Ativado">
                                <Shield className="w-5 h-5" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 text-muted-foreground" title="2FA Desativado">
                                <Shield className="w-5 h-5" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Editar"
                                data-testid={`button-edit-${user.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                title={user.isBlocked ? "Desbloquear" : "Bloquear"}
                                onClick={() => handleUserAction(user.id, user.isBlocked ? 'unblock' : 'block')}
                                disabled={updateUserMutation.isPending}
                                data-testid={`button-block-${user.id}`}
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                          Nenhum usuário encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {usersData?.total && usersData.total > 50 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {((usersPage - 1) * 50) + 1}-{Math.min(usersPage * 50, usersData.total)} de {usersData.total} usuários
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={usersPage === 1}
                      onClick={() => setUsersPage(p => p - 1)}
                      data-testid="button-prev-page"
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-primary text-primary-foreground"
                      data-testid="text-current-page"
                    >
                      {usersPage}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={usersPage * 50 >= usersData.total}
                      onClick={() => setUsersPage(p => p + 1)}
                      data-testid="button-next-page"
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Audit Logs */}
          <Card id="audit">
            <CardHeader>
              <CardTitle>Logs de Auditoria Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs?.slice(0, 10)?.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.entityType} • {new Date(log.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{log.ipAddress}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.userAgent?.substring(0, 20)}...
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum log de auditoria encontrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
