import { useQuery, useMutation } from '@tanstack/react-query';
import { useI18n } from '@/contexts/i18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Plus,
  ArrowUp,
  QrCode,
  Building,
  Gift,
  FileText,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  Users
} from 'lucide-react';

export default function WalletPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['/api/wallet'],
  });

  const withdrawMutation = useMutation({
    mutationFn: (data: { amount: number; method: string; bankData?: any }) =>
      apiRequest('POST', '/api/wallet/withdraw', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      toast({
        title: t('success.sent'),
        description: 'Saque processado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Erro ao processar saque',
        variant: 'destructive',
      });
    },
  });

  const handleAddFunds = () => {
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade de adicionar fundos será implementada',
    });
  };

  const handleWithdraw = () => {
    // Mock withdrawal - in real app would show withdrawal form
    withdrawMutation.mutate({
      amount: 1000,
      method: 'ted',
      bankData: { bank: 'Banco do Brasil', agency: '0001', account: '123456-7' }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-64 bg-muted rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const balance = parseFloat(wallet?.balance || '0');
  const cashbackBalance = parseFloat(wallet?.cashbackBalance || '0');
  const referralBonus = parseFloat(wallet?.referralBonus || '0');
  const totalEarned = parseFloat(wallet?.totalEarned || '0');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('wallet.title')}</h1>
        <p className="text-muted-foreground">Gerencie seu saldo, cashback e transações</p>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-br from-primary via-primary to-secondary rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-primary-foreground/80 text-sm mb-2">{t('wallet.balance')}</p>
              <h2 className="text-5xl font-bold text-primary-foreground">
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddFunds}
                className="bg-white/20 backdrop-blur-sm text-primary-foreground hover:bg-white/30"
                data-testid="add-funds-button"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('wallet.addFunds')}
              </Button>
              <Button
                onClick={handleWithdraw}
                className="bg-white/20 backdrop-blur-sm text-primary-foreground hover:bg-white/30"
                disabled={withdrawMutation.isPending}
                data-testid="withdraw-button"
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                {t('wallet.withdraw')}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-primary-foreground/70 text-xs mb-1">{t('wallet.cashback')}</p>
              <p className="text-2xl font-bold text-primary-foreground">
                R$ {cashbackBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-primary-foreground/70 text-xs mb-1">Bônus de Indicação</p>
              <p className="text-2xl font-bold text-primary-foreground">
                R$ {referralBonus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-primary-foreground/70 text-xs mb-1">Total em Cobranças</p>
              <p className="text-2xl font-bold text-primary-foreground">
                R$ {totalEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-accent/5"
          onClick={() => toast({ title: 'PIX', description: 'Transferência via PIX em desenvolvimento' })}
          data-testid="pix-transfer"
        >
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
            <QrCode className="h-6 w-6 text-accent" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground mb-1">Transferir via PIX</h3>
            <p className="text-sm text-muted-foreground">Transferência instantânea</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-primary/5"
          onClick={() => toast({ title: 'TED', description: 'Saque via TED em desenvolvimento' })}
          data-testid="ted-transfer"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground mb-1">Sacar via TED</h3>
            <p className="text-sm text-muted-foreground">1-2 dias úteis</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-warning/5"
          onClick={() => toast({ title: 'Cashback', description: 'Histórico de cashback em desenvolvimento' })}
          data-testid="view-cashback"
        >
          <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
            <Gift className="h-6 w-6 text-warning" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground mb-1">Cashback</h3>
            <p className="text-sm text-muted-foreground">Ver histórico</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-secondary/5"
          onClick={() => toast({ title: 'Extrato', description: 'Extrato detalhado em desenvolvimento' })}
          data-testid="view-statement"
        >
          <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
            <FileText className="h-6 w-6 text-secondary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground mb-1">Extrato</h3>
            <p className="text-sm text-muted-foreground">Ver movimentações</p>
          </div>
        </Button>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">{t('wallet.transactions')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Últimas movimentações da carteira</p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="export-transactions">
            <Download className="h-4 w-4" />
            {t('common.export')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {wallet?.transactions?.length > 0 ? wallet.transactions.map((transaction: any, index: number) => (
              <div key={transaction.id || index} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    transaction.type === 'credit' || transaction.type === 'payment_received' || transaction.type === 'cashback' || transaction.type === 'referral'
                      ? 'bg-success/10' : 'bg-destructive/10'
                  }`}>
                    {(transaction.type === 'credit' || transaction.type === 'payment_received') && 
                      <ArrowDownCircle className="h-6 w-6 text-success" />}
                    {transaction.type === 'debit' && <ArrowUpCircle className="h-6 w-6 text-destructive" />}
                    {transaction.type === 'cashback' && <Gift className="h-6 w-6 text-success" />}
                    {transaction.type === 'referral' && <Users className="h-6 w-6 text-success" />}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {transaction.description || 'Transação'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString('pt-BR')} às {new Date(transaction.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${
                    parseFloat(transaction.amount) >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {parseFloat(transaction.amount) >= 0 ? '+' : ''}
                    R$ {Math.abs(parseFloat(transaction.amount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Saldo: R$ {parseFloat(transaction.balanceAfter || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma transação encontrada</p>
                <p className="text-sm">Suas transações aparecerão aqui</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
