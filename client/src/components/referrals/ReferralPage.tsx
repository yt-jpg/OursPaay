import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/i18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  CheckCircle,
  DollarSign,
  Trophy,
  Copy,
  Share2,
  Shield,
  Smartphone,
  IdCard,
  AlertTriangle,
  Clock,
  UserX
} from 'lucide-react';

export default function ReferralPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();

  const { data: referralStats } = useQuery({
    queryKey: ['/api/referrals/stats'],
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['/api/referrals'],
  });

  const handleCopyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(user?.referralCode || '');
      toast({
        title: t('success.copied'),
        description: 'Código de indicação copiado!',
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Erro ao copiar código',
        variant: 'destructive',
      });
    }
  };

  const handleShare = (platform: string) => {
    const referralUrl = `${window.location.origin}/register?ref=${user?.referralCode}`;
    const message = `Conheça a OursPaay, a melhor plataforma de cobranças! Use meu código ${user?.referralCode} e ganhe bônus: ${referralUrl}`;

    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Conheça a OursPaay&body=${encodeURIComponent(message)}`;
        break;
      default:
        navigator.clipboard.writeText(referralUrl);
        toast({
          title: t('success.copied'),
          description: 'Link de indicação copiado!',
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'blocked':
        return <UserX className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'pending':
        return 'Pendente';
      case 'blocked':
        return 'Bloqueada';
      default:
        return status;
    }
  };

  const getValidationIcon = (field: string, value: boolean) => {
    const icons = {
      ip: Shield,
      device: Smartphone,
      kyc: IdCard,
    };
    const Icon = icons[field as keyof typeof icons] || Shield;
    
    return (
      <Icon 
        className={`h-4 w-4 ${value ? 'text-success' : 'text-muted-foreground'}`}
        title={value ? `${field.toUpperCase()} verificado` : `${field.toUpperCase()} pendente`}
      />
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('referrals.title')}</h1>
        <p className="text-muted-foreground">{t('referrals.subtitle')}</p>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('referrals.total')}</h3>
            <p className="text-3xl font-bold text-foreground" data-testid="total-referrals">
              {referralStats?.total || referrals.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('referrals.active')}</h3>
            <p className="text-3xl font-bold text-foreground" data-testid="active-referrals">
              {referrals.filter((r: any) => r.status === 'active').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-warning" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('referrals.bonus')}</h3>
            <p className="text-3xl font-bold text-foreground" data-testid="total-bonus">
              R$ {referrals.filter((r: any) => r.isPaid).reduce((sum: number, r: any) => sum + parseFloat(r.rewardAmount || '0'), 0).toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('referrals.level')}</h3>
            <p className="text-3xl font-bold text-foreground">Gold</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Section */}
      <div className="bg-gradient-to-br from-primary via-primary to-secondary rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-primary-foreground mb-2">
              {t('referrals.code')}
            </h3>
            <p className="text-primary-foreground/80 mb-4">
              Compartilhe e ganhe R$ 100 por indicação confirmada
            </p>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 font-mono text-2xl font-bold text-primary-foreground">
                {user?.referralCode || 'LOADING...'}
              </div>
              <Button
                onClick={handleCopyReferralCode}
                className="bg-white/20 backdrop-blur-sm text-primary-foreground hover:bg-white/30"
                data-testid="copy-referral-code"
              >
                <Copy className="h-4 w-4 mr-2" />
                {t('referrals.copy')}
              </Button>
            </div>
          </div>
          <div className="hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
              alt="Compartilhamento e conexões"
              className="w-48 h-48 rounded-xl object-cover"
            />
          </div>
        </div>
      </div>

      {/* Share Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compartilhar via</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 py-6"
              onClick={() => handleShare('whatsapp')}
              data-testid="share-whatsapp"
            >
              <div className="text-green-600 text-xl">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
                </svg>
              </div>
              <span className="font-medium text-foreground">WhatsApp</span>
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 py-6"
              onClick={() => handleShare('email')}
              data-testid="share-email"
            >
              <div className="text-primary text-xl">📧</div>
              <span className="font-medium text-foreground">E-mail</span>
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 py-6"
              onClick={() => handleShare('twitter')}
              data-testid="share-twitter"
            >
              <div className="text-blue-400 text-xl">🐦</div>
              <span className="font-medium text-foreground">Twitter</span>
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 py-6"
              onClick={() => handleShare('facebook')}
              data-testid="share-facebook"
            >
              <div className="text-blue-600 text-xl">📘</div>
              <span className="font-medium text-foreground">Facebook</span>
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 py-6"
              onClick={() => handleShare('link')}
              data-testid="copy-link"
            >
              <Share2 className="h-6 w-6 text-secondary" />
              <span className="font-medium text-foreground">Copiar Link</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">{t('referrals.history')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Acompanhe suas indicações e recompensas</p>
          </div>
          <select className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option>Todas</option>
            <option>Ativas</option>
            <option>Pendentes</option>
            <option>Bloqueadas</option>
          </select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Indicado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Data de Cadastro
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Recompensa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Verificação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {referrals.length > 0 ? referrals.map((referral: any) => (
                  <tr key={referral.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"
                          alt="Referral"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-foreground">Usuário Indicado</p>
                          <p className="text-xs text-muted-foreground">usuario@email.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-foreground">
                        {new Date(referral.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className={`text-sm font-semibold ${
                        referral.isPaid ? 'text-success' : 
                        referral.status === 'blocked' ? 'text-muted-foreground line-through' :
                        'text-warning'
                      }`}>
                        R$ {parseFloat(referral.rewardAmount || '0').toLocaleString('pt-BR')}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge 
                        variant={
                          referral.status === 'active' ? 'default' :
                          referral.status === 'pending' ? 'secondary' :
                          'destructive'
                        }
                        className="flex items-center gap-1 w-fit"
                      >
                        {getStatusIcon(referral.status)}
                        {getStatusLabel(referral.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getValidationIcon('ip', true)}
                        {getValidationIcon('device', referral.status !== 'pending')}
                        {getValidationIcon('kyc', referral.status === 'active')}
                        {referral.status === 'blocked' && (
                          <AlertTriangle className="h-4 w-4 text-destructive" title="Fraude detectada" />
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma indicação ainda</p>
                      <p className="text-sm">Compartilhe seu código e comece a ganhar!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
