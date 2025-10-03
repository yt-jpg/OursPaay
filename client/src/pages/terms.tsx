import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Terms() {
  const [legalTermsAccepted, setLegalTermsAccepted] = useState(false);
  const [platformTermsAccepted, setPlatformTermsAccepted] = useState(false);
  const [userMetadata, setUserMetadata] = useState({
    ip: "",
    device: "",
    timestamp: new Date().toISOString(),
  });
  const { toast } = useToast();

  useEffect(() => {
    // Get user IP and device info
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        setUserMetadata(prev => ({
          ...prev,
          ip: data.ip,
          device: navigator.userAgent,
        }));
      })
      .catch(() => {
        setUserMetadata(prev => ({
          ...prev,
          ip: "Unknown",
          device: navigator.userAgent,
        }));
      });
  }, []);

  const acceptTermsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/accept-terms', {
        termsVersion: '1.0',
        ipAddress: userMetadata.ip,
        userAgent: userMetadata.device,
      });
    },
    onSuccess: () => {
      toast({
        title: "Termos aceitos com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Erro ao aceitar termos",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  const canAccept = legalTermsAccepted && platformTermsAccepted;

  const handleAccept = () => {
    if (!canAccept) return;
    acceptTermsMutation.mutate();
  };

  const handleDecline = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Card className="overflow-hidden">
          {/* Header */}
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Aceite de Termos e Condições</h1>
                <p className="text-primary-foreground/80">É necessário aceitar ambos os contratos para continuar</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Contract 1: Legal */}
            <Card className="border border-border">
              <div className="bg-muted p-4 border-b border-border">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Contrato Legal - Conformidade com Legislação Brasileira
                </h3>
              </div>
              <div className="p-4 bg-background max-h-64 overflow-y-auto">
                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="mb-3"><strong>CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE INTERMEDIAÇÃO DE COBRANÇAS</strong></p>
                  
                  <p className="mb-3">Este contrato é regido pelas seguintes legislações:</p>
                  
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Lei Federal nº 13.709/2018 (LGPD)</strong> - Lei Geral de Proteção de Dados</li>
                    <li><strong>Lei Federal nº 8.078/1990 (CDC)</strong> - Código de Defesa do Consumidor</li>
                    <li><strong>Lei Federal nº 12.965/2014</strong> - Marco Civil da Internet</li>
                    <li><strong>Lei Federal nº 10.406/2002</strong> - Código Civil Brasileiro</li>
                    <li><strong>Resolução BCB nº 4.656/2018</strong> - Arranjos de Pagamento</li>
                  </ul>
                  
                  <p className="mb-3"><strong>CLÁUSULA 1ª - DO OBJETO</strong></p>
                  <p className="mb-3">1.1. O presente contrato tem por objeto a prestação de serviços de intermediação de cobranças entre credores e devedores, atuando a PLATAFORMA exclusivamente como facilitadora tecnológica.</p>
                  <p className="mb-3">1.2. A PLATAFORMA não atua como instituição financeira e não realiza operações privativas de bancos.</p>
                  
                  <p className="mb-3"><strong>CLÁUSULA 2ª - DA PROTEÇÃO DE DADOS</strong></p>
                  <p className="mb-3">2.1. O tratamento de dados pessoais seguirá rigorosamente a LGPD, garantindo princípios de finalidade, adequação, necessidade e transparência.</p>
                  <p className="mb-3">2.2. O USUÁRIO consente expressamente com a coleta e tratamento de dados para execução dos serviços, conforme Política de Privacidade.</p>
                  
                  <p className="mb-3"><strong>CLÁUSULA 3ª - DAS RESPONSABILIDADES</strong></p>
                  <p className="mb-3">3.1. A PLATAFORMA não se responsabiliza por dívidas não pagas ou inadimplência entre as partes.</p>
                  <p className="mb-3">3.2. Toda comunicação de cobrança deve respeitar o CDC, vedando-se práticas abusivas ou vexatórias.</p>
                  
                  <p className="text-muted-foreground italic mt-4">Versão 1.0 - Última atualização: Janeiro 2024</p>
                  <p className="text-muted-foreground italic">Hash do contrato: SHA256-A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6</p>
                </div>
              </div>
              <div className="p-4 bg-muted border-t border-border">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox 
                    id="legalTerms" 
                    checked={legalTermsAccepted}
                    onCheckedChange={(checked) => setLegalTermsAccepted(checked === true)}
                    data-testid="checkbox-legal-terms"
                  />
                  <span className="text-sm">
                    <span className="font-medium group-hover:text-primary transition-colors">Eu li e aceito</span> todos os termos do Contrato Legal e estou ciente das legislações aplicáveis
                  </span>
                </label>
              </div>
            </Card>
            
            {/* Contract 2: Platform Usage */}
            <Card className="border border-border">
              <div className="bg-muted p-4 border-b border-border">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" />
                  Contrato de Uso da Plataforma OursPay
                </h3>
              </div>
              <div className="p-4 bg-background max-h-64 overflow-y-auto">
                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="mb-3"><strong>TERMOS E CONDIÇÕES DE USO - OURSPAY</strong></p>
                  
                  <p className="mb-3"><strong>1. ACEITAÇÃO DOS TERMOS</strong></p>
                  <p className="mb-3">Ao acessar e usar a plataforma OursPay, você concorda integralmente com estes termos.</p>
                  
                  <p className="mb-3"><strong>2. CADASTRO E CONTA</strong></p>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>É necessário fornecer informações verdadeiras e atualizadas</li>
                    <li>Você é responsável pela segurança de sua senha e conta</li>
                    <li>Menores de 18 anos não podem criar conta sem autorização legal</li>
                  </ul>
                  
                  <p className="mb-3"><strong>3. USO DA PLATAFORMA</strong></p>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>Utilize a plataforma apenas para fins lícitos</li>
                    <li>Não compartilhe credenciais de acesso com terceiros</li>
                    <li>Respeite os limites técnicos e de uso estabelecidos</li>
                  </ul>
                  
                  <p className="mb-3"><strong>4. TAXAS E PAGAMENTOS</strong></p>
                  <p className="mb-3">4.1. Todas as taxas serão exibidas claramente antes de qualquer transação.</p>
                  <p className="mb-3">4.2. A plataforma cobra taxa de intermediação conforme tabela publicada.</p>
                  <p className="mb-3">4.3. Cashback promocional está sujeito a regras específicas de cada campanha.</p>
                  
                  <p className="mb-3"><strong>5. PRIVACIDADE E SEGURANÇA</strong></p>
                  <p className="mb-3">5.1. Seus dados são protegidos conforme nossa Política de Privacidade.</p>
                  <p className="mb-3">5.2. Implementamos medidas de segurança incluindo criptografia e 2FA.</p>
                  
                  <p className="mb-3"><strong>6. LIMITAÇÃO DE RESPONSABILIDADE</strong></p>
                  <p className="mb-3">6.1. A OursPay não garante o pagamento de dívidas entre usuários.</p>
                  <p className="mb-3">6.2. Não somos responsáveis por disputas contratuais entre credores e devedores.</p>
                  
                  <p className="text-muted-foreground italic mt-4">Versão 1.0 - Última atualização: Janeiro 2024</p>
                  <p className="text-muted-foreground italic">Hash do contrato: SHA256-Q7W8E9R0T1Y2U3I4O5P6A7S8D9F0G1H2</p>
                </div>
              </div>
              <div className="p-4 bg-muted border-t border-border">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox 
                    id="platformTerms" 
                    checked={platformTermsAccepted}
                    onCheckedChange={(checked) => setPlatformTermsAccepted(checked === true)}
                    data-testid="checkbox-platform-terms"
                  />
                  <span className="text-sm">
                    <span className="font-medium group-hover:text-primary transition-colors">Eu li e aceito</span> os Termos de Uso da Plataforma OursPay
                  </span>
                </label>
              </div>
            </Card>
            
            {/* Acceptance Metadata Info */}
            <Card className="bg-muted/50 border border-border">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Registro de Aceite
                </h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Timestamp: <span className="font-mono">{new Date(userMetadata.timestamp).toLocaleString('pt-BR')}</span></p>
                  <p>• IP do usuário: <span className="font-mono">{userMetadata.ip}</span></p>
                  <p>• Dispositivo: <span className="font-mono text-xs">{userMetadata.device.substring(0, 50)}...</span></p>
                  <p>• Versões aceitas: Legal v1.0 + Plataforma v1.0</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={handleDecline}
                data-testid="button-decline-terms"
              >
                Recusar
              </Button>
              <Button 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!canAccept || acceptTermsMutation.isPending}
                onClick={handleAccept}
                data-testid="button-accept-terms"
              >
                {acceptTermsMutation.isPending ? "Processando..." : "Aceitar e Continuar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
