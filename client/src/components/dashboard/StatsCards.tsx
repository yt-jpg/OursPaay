import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/contexts/i18nContext';
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Wallet, 
  ArrowUp, 
  ArrowDown,
  Minus
} from 'lucide-react';

interface StatsCardsProps {
  stats?: {
    totalRevenue: number;
    activeCharges: number;
    conversionRate: number;
    walletBalance: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const { t } = useI18n();

  const cards = [
    {
      title: t('dashboard.totalRevenue'),
      value: stats ? `R$ ${stats.totalRevenue.toLocaleString('pt-BR')}` : 'R$ 0,00',
      change: '+12.5%',
      changeType: 'positive' as const,
      subtitle: '28 cobranças pendentes',
      icon: DollarSign,
      color: 'primary',
    },
    {
      title: t('dashboard.activeCharges'),
      value: stats?.activeCharges?.toString() || '0',
      change: '-3.2%',
      changeType: 'negative' as const,
      subtitle: '18 pagamentos confirmados',
      icon: FileText,
      color: 'accent',
    },
    {
      title: t('dashboard.conversionRate'),
      value: stats ? `${stats.conversionRate.toFixed(1)}%` : '0.0%',
      change: '+5.1%',
      changeType: 'positive' as const,
      subtitle: 'vs mês anterior',
      icon: TrendingUp,
      color: 'warning',
    },
    {
      title: t('dashboard.walletBalance'),
      value: stats ? `R$ ${stats.walletBalance.toLocaleString('pt-BR')}` : 'R$ 0,00',
      change: '0%',
      changeType: 'neutral' as const,
      subtitle: 'Disponível para saque',
      icon: Wallet,
      color: 'secondary',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const changeIcon = card.changeType === 'positive' ? ArrowUp : 
                          card.changeType === 'negative' ? ArrowDown : Minus;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200" data-testid={`stats-card-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {card.title}
                  </p>
                  <h3 className="text-2xl font-bold mb-2" data-testid={`stats-value-${index}`}>
                    {card.value}
                  </h3>
                  <div className="flex items-center gap-1">
                    {changeIcon && (
                      <changeIcon className={`h-4 w-4 ${
                        card.changeType === 'positive' ? 'text-success' :
                        card.changeType === 'negative' ? 'text-destructive' :
                        'text-muted-foreground'
                      }`} />
                    )}
                    <span className={`text-sm font-medium ${
                      card.changeType === 'positive' ? 'text-success' :
                      card.changeType === 'negative' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`}>
                      {card.change}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      vs mês anterior
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  card.color === 'primary' ? 'bg-primary/10' :
                  card.color === 'accent' ? 'bg-accent/10' :
                  card.color === 'warning' ? 'bg-warning/10' :
                  card.color === 'secondary' ? 'bg-secondary/10' :
                  'bg-muted'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    card.color === 'primary' ? 'text-primary' :
                    card.color === 'accent' ? 'text-accent' :
                    card.color === 'warning' ? 'text-warning' :
                    card.color === 'secondary' ? 'text-secondary' :
                    'text-muted-foreground'
                  }`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
