<<<<<<< HEAD
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Dashboard from '@/components/dashboard/Dashboard';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/auth');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  useEffect(() => {
    // Load sidebar state from localStorage
    const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    setSidebarCollapsed(savedCollapsed);
  }, []);

  const handleSidebarToggle = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-70'
      }`}>
        <Header 
          className="sticky top-0 z-30"
          onNotificationClick={() => setShowNotifications(true)}
        />
        
        <main className="p-6">
          <Dashboard />
        </main>
      </div>

      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
=======
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Sidebar } from "@/components/sidebar";
import { Chat } from "@/components/chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { 
  Plus, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Menu,
  MessageCircle,
  Sun,
  Moon,
  Monitor
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const { user } = useAuth() as { user: any };
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCreateBilling, setShowCreateBilling] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  
  // WebSocket connection
  useWebSocket(user?.id);

  // Fetch billing stats
  const { data: stats } = useQuery({
    queryKey: ['/api/billings/stats'],
    enabled: !!user,
  });

  // Fetch billings
  const { data: billings } = useQuery({
    queryKey: ['/api/billings'],
    enabled: !!user,
  });

  // Fetch wallet
  const { data: wallet } = useQuery({
    queryKey: ['/api/wallet'],
    enabled: !!user,
  });

  // Fetch notifications count
  const { data: notificationsCount } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    enabled: !!user,
  });

  // Create billing mutation
  const createBillingMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/billings', data);
    },
    onSuccess: () => {
      toast({
        title: "Cobrança criada com sucesso!",
        description: "A cobrança foi enviada ao devedor.",
      });
      setShowCreateBilling(false);
      queryClient.invalidateQueries({ queryKey: ['/api/billings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billings/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar cobrança",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  const handleCreateBilling = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const billingData = {
      debtorName: formData.get('debtorName') as string,
      debtorEmail: formData.get('debtorEmail') as string || undefined,
      debtorCpfCnpj: formData.get('debtorCpfCnpj') as string || undefined,
      amount: parseFloat(formData.get('amount') as string),
      description: formData.get('description') as string,
      dueDate: new Date(formData.get('dueDate') as string).toISOString(),
      paymentMethod: formData.get('paymentMethod') as string,
      allowInstallments: formData.get('allowInstallments') === 'on',
      interestRate: formData.get('interestRate') ? parseFloat(formData.get('interestRate') as string) : undefined,
    };

    createBillingMutation.mutate(billingData);
  };

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num || 0);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pendente", className: "status-pending" },
      paid: { label: "Pago", className: "status-paid" },
      overdue: { label: "Vencido", className: "status-overdue" },
      cancelled: { label: "Cancelado", className: "status-cancelled" },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        notificationCount={notificationsCount?.count || 0}
      />
      
      {/* Main Content */}
      <main className={`transition-width ${sidebarCollapsed ? 'main-content-collapsed' : 'main-content-expanded'}`}>
        {/* Top Bar */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between p-4 lg:px-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMobileSidebarOpen(true)}
                data-testid="button-mobile-menu"
              >
                <Menu className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Bem-vindo de volta, {user?.firstName}!</p>
              </div>
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
              
              {/* Quick Actions */}
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setShowCreateBilling(true)}
                data-testid="button-new-billing"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nova Cobrança
              </Button>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg shadow-blue-500/10 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-950/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-3 py-1 rounded-full">Este mês</span>
                </div>
                <h3 className="text-3xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" data-testid="text-total-receivable">
                  {formatCurrency(stats?.totalReceivable || 0)}
                </h3>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total a Receber</p>
                <div className="mt-4 flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">12.5%</span>
                  <span className="text-slate-500">vs mês anterior</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg shadow-emerald-500/10 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-950/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">Pago</span>
                </div>
                <h3 className="text-3xl font-bold mb-1 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent" data-testid="text-paid-amount">
                  {formatCurrency(stats?.paidAmount || 0)}
                </h3>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Recebido</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">62.8%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full shadow-lg" style={{width: "62.8%"}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg shadow-amber-500/10 bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-900 dark:to-amber-950/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/50">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-full">Pendente</span>
                </div>
                <h3 className="text-3xl font-bold mb-1 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent" data-testid="text-pending-amount">
                  {formatCurrency(stats?.pendingAmount || 0)}
                </h3>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Aguardando</p>
                <div className="mt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-lg" data-testid="text-pending-count">
                      {stats?.pendingCount || 0}
                    </span> cobranças pendentes
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg shadow-rose-500/10 bg-gradient-to-br from-white to-rose-50/30 dark:from-slate-900 dark:to-rose-950/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/50">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-3 py-1 rounded-full">Atrasado</span>
                </div>
                <h3 className="text-3xl font-bold mb-1 bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent" data-testid="text-overdue-amount">
                  {formatCurrency(stats?.overdueAmount || 0)}
                </h3>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Vencido</p>
                <div className="mt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-lg" data-testid="text-overdue-count">
                      {stats?.overdueCount || 0}
                    </span> cobranças vencidas
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Transactions & Wallet */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-white bg-clip-text text-transparent">Transações Recentes</CardTitle>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950">Ver todas</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {billings?.slice(0, 5)?.map((billing: any) => (
                      <div key={billing.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            billing.status === 'paid' ? 'bg-success/10' :
                            billing.status === 'pending' ? 'bg-warning/10' :
                            'bg-destructive/10'
                          }`}>
                            {billing.status === 'paid' ? (
                              <CheckCircle className="w-5 h-5 text-success" />
                            ) : billing.status === 'pending' ? (
                              <Clock className="w-5 h-5 text-warning" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-destructive" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{billing.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(billing.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(billing.amount)}</p>
                          {getStatusBadge(billing.status)}
                        </div>
                      </div>
                    ))}
                    
                    {(!billings || billings.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhuma transação encontrada</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setShowCreateBilling(true)}
                        >
                          Criar primeira cobrança
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Wallet & Quick Actions */}
            <div className="space-y-6">
              {/* Wallet Balance */}
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold opacity-90 tracking-wide uppercase">Saldo Disponível</p>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold mb-6 tracking-tight" data-testid="text-wallet-balance">
                    {formatCurrency(wallet?.balance || 0)}
                  </h3>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="flex-1 bg-white/20 hover:bg-white/30 border-white/30 text-white font-semibold backdrop-blur-sm">
                      Sacar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-white/20 hover:bg-white/30 border-white/30 text-white font-semibold backdrop-blur-sm">
                      Transferir
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-white bg-clip-text text-transparent">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition-all"
                      onClick={() => setShowCreateBilling(true)}
                      data-testid="button-quick-create"
                    >
                      <Plus className="w-5 h-5 mr-3" />
                      Criar Cobrança
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-2 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 transition-all">
                      <Clock className="w-5 h-5 mr-3" />
                      Ver Histórico
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950 hover:text-purple-600 transition-all">
                      <MessageCircle className="w-5 h-5 mr-3" />
                      Enviar Lembrete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Create Billing Form */}
          {showCreateBilling && (
            <Card>
              <CardHeader>
                <CardTitle>Criar Nova Cobrança</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateBilling} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="debtorName">Nome do Devedor</Label>
                      <Input 
                        id="debtorName"
                        name="debtorName"
                        placeholder="Nome completo"
                        required
                        data-testid="input-debtor-name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="amount">Valor (R$)</Label>
                      <Input 
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        required
                        data-testid="input-amount"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="debtorEmail">Email</Label>
                      <Input 
                        id="debtorEmail"
                        name="debtorEmail"
                        type="email"
                        placeholder="email@exemplo.com"
                        data-testid="input-debtor-email"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="debtorCpfCnpj">CPF/CNPJ</Label>
                      <Input 
                        id="debtorCpfCnpj"
                        name="debtorCpfCnpj"
                        placeholder="000.000.000-00"
                        data-testid="input-debtor-cpf"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="dueDate">Vencimento</Label>
                      <Input 
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        required
                        data-testid="input-due-date"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                      <Select name="paymentMethod" defaultValue="pix">
                        <SelectTrigger data-testid="select-payment-method">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="boleto">Boleto</SelectItem>
                          <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                          <SelectItem value="ted_doc">TED/DOC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea 
                      id="description"
                      name="description"
                      rows={3}
                      placeholder="Descreva o motivo da cobrança..."
                      required
                      data-testid="textarea-description"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox name="allowInstallments" data-testid="checkbox-installments" />
                      <span className="text-sm">Permitir parcelamento</span>
                    </label>
                    
                    <div className="flex items-center gap-2">
                      <Label htmlFor="interestRate" className="text-sm">Taxa de juros (%)</Label>
                      <Input 
                        id="interestRate"
                        name="interestRate"
                        type="number"
                        step="0.01"
                        className="w-20"
                        placeholder="0"
                        data-testid="input-interest-rate"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowCreateBilling(false)}
                      data-testid="button-cancel-billing"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createBillingMutation.isPending}
                      data-testid="button-submit-billing"
                    >
                      {createBillingMutation.isPending ? "Criando..." : "Criar Cobrança"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      {/* Chat Component */}
      <Chat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      
      {/* Chat Floating Button */}
      {!chatOpen && (
        <Button
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          onClick={() => setChatOpen(true)}
          data-testid="button-open-chat"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}
>>>>>>> a757380dbfe2d95040e42f9db40e45de5910a0af
    </div>
  );
}
