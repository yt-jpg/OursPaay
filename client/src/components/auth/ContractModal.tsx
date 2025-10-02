import { useState } from 'react';
import { useI18n } from '@/contexts/i18nContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { File, FileText, Download, Info } from 'lucide-react';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContractModal({ isOpen, onClose, onSuccess }: ContractModalProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  
  const [acceptances, setAcceptances] = useState({
    serviceContract: false,
    termsOfUse: false,
    dataConsent: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAcceptanceChange = (key: keyof typeof acceptances, checked: boolean) => {
    setAcceptances(prev => ({ ...prev, [key]: checked }));
  };

  const allAccepted = Object.values(acceptances).every(Boolean);

  const handleAccept = async () => {
    if (!allAccepted) return;

    setIsLoading(true);
    
    try {
      await apiRequest('POST', '/api/contracts/accept', {
        contractType: 'service_agreement',
        contractVersion: '1.0',
        acceptances,
      });

      toast({
        title: t('success.saved'),
        description: 'Contratos aceitos com sucesso',
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || 'Erro ao aceitar contratos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadContract = (type: string) => {
    // Generate PDF download
    const link = document.createElement('a');
    link.href = `/api/contracts/download/${type}`;
    link.download = `contrato_${type}.pdf`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {t('contracts.title')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t('contracts.subtitle')}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-6">
          {/* Service Contract */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <File className="h-5 w-5 text-primary" />
                  {t('contracts.service')}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadContract('service')}
                  className="text-primary hover:text-primary/80"
                  data-testid="download-service-contract"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t('contracts.download')}
                </Button>
              </div>
            </div>
            <ScrollArea className="h-64 p-4 bg-background/50">
              <div className="text-sm text-foreground space-y-4">
                <p><strong>CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBRANÇA</strong></p>
                <p>
                  Por este instrumento particular de contrato, as partes abaixo qualificadas:
                </p>
                <p>
                  <strong>CONTRATANTE:</strong> Pessoa física ou jurídica que utiliza os serviços da plataforma OursPaay para gestão de cobranças e recebimentos.
                </p>
                <p>
                  <strong>CONTRATADA:</strong> OursPaay Tecnologia em Pagamentos Ltda., empresa especializada em soluções de cobrança e gestão financeira.
                </p>
                <p>
                  <strong>Cláusula 1ª - DO OBJETO:</strong> Este contrato tem por objeto a prestação de serviços de intermediação de cobranças entre credores e devedores, incluindo gestão de carteira digital, sistema de indicações e suporte técnico especializado.
                </p>
                <p>
                  <strong>Cláusula 2ª - DAS TAXAS E TARIFAS:</strong> O contratante autoriza a cobrança de taxa de serviço conforme tabela vigente, disponível na plataforma e sujeita a alterações mediante comunicação prévia de 30 dias.
                </p>
                <p>
                  <strong>Cláusula 3ª - DA PROTEÇÃO DE DADOS:</strong> Em conformidade com a LGPD (Lei 13.709/2018), a contratada compromete-se a proteger os dados pessoais dos usuários, utilizando-os exclusivamente para os fins contratados.
                </p>
                <p>
                  <strong>Cláusula 4ª - DAS RESPONSABILIDADES:</strong> A contratada responsabiliza-se pela segurança da plataforma e integridade das transações, enquanto o contratante é responsável pela veracidade das informações fornecidas.
                </p>
              </div>
            </ScrollArea>
          </div>

          {/* Terms of Use */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-secondary" />
                  {t('contracts.terms')}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadContract('terms')}
                  className="text-primary hover:text-primary/80"
                  data-testid="download-terms"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t('contracts.download')}
                </Button>
              </div>
            </div>
            <ScrollArea className="h-64 p-4 bg-background/50">
              <div className="text-sm text-foreground space-y-4">
                <p><strong>TERMOS E CONDIÇÕES DE USO</strong></p>
                <p>
                  <strong>1. ACEITAÇÃO DOS TERMOS:</strong> Ao utilizar a plataforma OursPaay, você concorda com estes termos e condições de uso, bem como com nossa Política de Privacidade.
                </p>
                <p>
                  <strong>2. CADASTRO E CONTA:</strong> Para utilizar nossos serviços, é necessário criar uma conta fornecendo informações verdadeiras, precisas e atualizadas.
                </p>
                <p>
                  <strong>3. SERVIÇOS OFERECIDOS:</strong> A plataforma oferece serviços de cobrança, pagamentos, carteira digital, chat com suporte e sistema de indicações.
                </p>
                <p>
                  <strong>4. PRIVACIDADE:</strong> Respeitamos sua privacidade conforme nossa Política de Privacidade e em conformidade com a LGPD.
                </p>
                <p>
                  <strong>5. RESPONSABILIDADES DO USUÁRIO:</strong> O usuário é responsável por manter a confidencialidade de suas credenciais e por todas as atividades realizadas em sua conta.
                </p>
                <p>
                  <strong>6. PROIBIÇÕES:</strong> É proibido usar a plataforma para atividades ilegais, fraudulentas ou que violem direitos de terceiros.
                </p>
                <p>
                  <strong>7. MODIFICAÇÕES:</strong> Reservamo-nos o direito de modificar estes termos a qualquer momento, comunicando as alterações com antecedência.
                </p>
              </div>
            </ScrollArea>
          </div>

          {/* Acceptance Checkboxes */}
          <div className="space-y-4 bg-muted/50 p-4 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <Checkbox
                id="acceptContract"
                checked={acceptances.serviceContract}
                onCheckedChange={(checked) => handleAcceptanceChange('serviceContract', !!checked)}
                data-testid="accept-service-contract"
              />
              <label htmlFor="acceptContract" className="text-sm text-foreground leading-relaxed">
                Li e aceito os termos do <strong>Contrato de Prestação de Serviços</strong>
              </label>
            </div>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="acceptTerms"
                checked={acceptances.termsOfUse}
                onCheckedChange={(checked) => handleAcceptanceChange('termsOfUse', !!checked)}
                data-testid="accept-terms"
              />
              <label htmlFor="acceptTerms" className="text-sm text-foreground leading-relaxed">
                Li e aceito os <strong>Termos de Uso da Plataforma</strong>
              </label>
            </div>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="consentData"
                checked={acceptances.dataConsent}
                onCheckedChange={(checked) => handleAcceptanceChange('dataConsent', !!checked)}
                data-testid="consent-data"
              />
              <label htmlFor="consentData" className="text-sm text-foreground leading-relaxed">
                Autorizo o tratamento dos meus dados pessoais conforme <strong>Política de Privacidade</strong> e <strong>LGPD</strong>
              </label>
            </div>
          </div>

          {/* Immutable Record Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-foreground font-medium mb-1">{t('contracts.immutableRecord')}</p>
                <p className="text-muted-foreground">
                  {t('contracts.immutableDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
            data-testid="cancel-contracts"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={!allAccepted || isLoading}
            onClick={handleAccept}
            data-testid="accept-contracts"
          >
            {isLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
            ) : null}
            {t('contracts.accept')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
