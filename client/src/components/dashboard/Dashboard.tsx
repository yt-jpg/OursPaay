import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/contexts/i18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatsCards from './StatsCards';
import { 
  Download, 
  Plus, 
  Filter,
  Eye,
  NotebookPen,
  Handshake,
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function Dashboard() {
  const { t } = useI18n();

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: recentTransactions = [] } = useQuery({
    queryKey: ['/api/transactions/recent'],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.overview')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" data-testid="export-pdf">
            <Download className="h-4 w-4" />
            {t('common.export')} PDF
          </Button>
          <Button className="flex items-center gap-2" data-testid="new-charge">
            <Plus className="h-4 w-4" />
            {t('dashboard.newCharge')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={dashboardStats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t('dashboard.monthlyRevenue')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Últimos 6 meses</p>
            </div>
            <select className="px-3 py-1.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option>2024</option>
              <option>2023</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-4">
              {dashboardStats?.monthlyRevenue?.map((value: number, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer relative group"
                    style={{ height: `${(value / Math.max(...(dashboardStats.monthlyRevenue || [1]))) * 100}%` }}
                    title={`R$ ${value.toLocaleString('pt-BR')}`}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      R$ {(value / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][index]}
                  </span>
                </div>
              )) || []}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t('dashboard.paymentMethods')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Distribuição por tipo</p>
            </div>
            <Button variant="outline" size="sm">
              Ver Detalhes
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats?.paymentMethods?.map((method: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {method.name === 'PIX' && <div className="w-4 h-4 bg-primary rounded"></div>}
                      {method.name === 'Cartão' && <div className="w-4 h-4 bg-accent rounded"></div>}
                      {method.name === 'Boleto' && <div className="w-4 h-4 bg-warning rounded"></div>}
                    </div>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.count} transações</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ {method.amount.toLocaleString('pt-BR')}</p>
                    <p className="text-sm text-success">{method.percentage}%</p>
                  </div>
                </div>
              )) || []}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">{t('dashboard.recentTransactions')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Últimas 10 operações realizadas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="filter-transactions">
              <Filter className="h-4 w-4" />
              {t('common.filter')}
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="export-transactions">
              <Download className="h-4 w-4" />
              {t('common.export')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('common.amount')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('common.status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('common.date')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTransactions.length > 0 ? recentTransactions.map((transaction: any) => (
                  <tr key={transaction.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-mono text-muted-foreground">
                      #{transaction.id?.slice(-6)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {transaction.customerName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{transaction.customerName || 'Cliente'}</p>
                          <p className="text-xs text-muted-foreground">{transaction.customerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm capitalize">{transaction.method}</td>
                    <td className="px-4 py-4 font-semibold">
                      R$ {parseFloat(transaction.amount).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' ? 'bg-success/10 text-success' :
                        transaction.status === 'pending' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {transaction.status === 'completed' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                        {transaction.status === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
                        {transaction.status === 'failed' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                        {transaction.status === 'completed' ? 'Pago' :
                         transaction.status === 'pending' ? 'Pendente' :
                         'Cancelado'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" data-testid={`view-transaction-${transaction.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {transaction.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="sm">
                              <NotebookPen className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Handshake className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhuma transação encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-primary/5"
                  data-testid="quick-new-charge"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{t('dashboard.newCharge')}</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-accent/5"
                  data-testid="quick-import-batch"
                >
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Download className="h-6 w-6 text-accent rotate-180" />
                  </div>
                  <span className="text-sm font-medium">{t('dashboard.importBatch')}</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-warning/5"
                  data-testid="quick-export-data"
                >
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Download className="h-6 w-6 text-warning" />
                  </div>
                  <span className="text-sm font-medium">{t('dashboard.exportData')}</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-secondary/5"
                  data-testid="quick-new-client"
                >
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Plus className="h-6 w-6 text-secondary" />
                  </div>
                  <span className="text-sm font-medium">{t('dashboard.newClient')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('dashboard.systemAlerts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">12 cobranças vencidas</p>
                  <p className="text-xs text-muted-foreground mt-1">Requer atenção imediata</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
                <Clock className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">28 vencem em 3 dias</p>
                  <p className="text-xs text-muted-foreground mt-1">Enviar lembretes</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Sistema funcionando</p>
                  <p className="text-xs text-muted-foreground mt-1">Todos os serviços online</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
