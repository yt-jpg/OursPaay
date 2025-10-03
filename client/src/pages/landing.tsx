import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Shield, 
  Smartphone, 
  CheckCircle,
  Users,
  TrendingUp,
  Globe,
  Lock
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
              OP
            </div>
            <h1 className="text-2xl font-bold text-primary">OursPay</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <a href="#features">Recursos</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#about">Sobre</a>
            </Button>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-login"
            >
              Entrar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            Plataforma Moderna de Cobranças
          </Badge>
          
          <h1 className="text-5xl font-bold mb-6 text-balance">
            Gerencie suas cobranças de forma 
            <span className="text-primary"> segura e eficiente</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            A OursPay é a solução completa para pagadores e devedores, oferecendo 
            transparência total, conformidade legal e a melhor experiência do mercado.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-get-started"
            >
              Começar Agora
            </Button>
            <Button size="lg" variant="outline">
              Conhecer Recursos
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="w-8 h-8 text-success" />
              <span className="text-sm font-medium">100% Seguro</span>
              <span className="text-xs text-muted-foreground">Conformidade LGPD</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8 text-success" />
              <span className="text-sm font-medium">Transparência Total</span>
              <span className="text-xs text-muted-foreground">Sem taxas ocultas</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Smartphone className="w-8 h-8 text-success" />
              <span className="text-sm font-medium">Multiplataforma</span>
              <span className="text-xs text-muted-foreground">Web e Mobile</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-card/50 backdrop-blur py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Recursos Principais</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas profissionais para gestão completa de cobranças e pagamentos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Múltiplos Métodos de Pagamento</h3>
                <p className="text-muted-foreground text-sm">
                  PIX, TED/DOC, boleto, cartão de crédito e até criptomoedas. 
                  Ofereça flexibilidade total aos seus clientes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Segurança Avançada</h3>
                <p className="text-muted-foreground text-sm">
                  Autenticação de dois fatores, criptografia de ponta a ponta 
                  e conformidade total com a LGPD.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Chat Integrado</h3>
                <p className="text-muted-foreground text-sm">
                  Comunicação direta entre pagador e devedor com histórico 
                  completo e notificações em tempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Dashboard Avançado</h3>
                <p className="text-muted-foreground text-sm">
                  Visualize estatísticas detalhadas, histórico de transações 
                  e gerencie todas suas cobranças em um só lugar.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Acessibilidade Total</h3>
                <p className="text-muted-foreground text-sm">
                  Dark mode, alto contraste e recursos inclusivos para 
                  pessoas com deficiência.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Conformidade Legal</h3>
                <p className="text-muted-foreground text-sm">
                  Todos os contratos revisados por advogados e conformidade 
                  total com a legislação brasileira.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Pronto para revolucionar suas cobranças?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Junte-se a milhares de empresas que já escolheram a OursPay 
              para modernizar sua gestão de cobranças.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-start-now"
              >
                Começar Gratuitamente
              </Button>
              <Button size="lg" variant="outline">
                Falar com Especialista
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                  OP
                </div>
                <span className="text-xl font-bold text-primary">OursPay</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A plataforma moderna e segura para gestão de cobranças.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Segurança</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Carreiras</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 OursPay. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
