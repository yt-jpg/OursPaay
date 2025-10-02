import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/i18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Phone, Wallet } from 'lucide-react';
import TwoFactorModal from './TwoFactorModal';

export default function LoginForm() {
  const { login } = useAuth();
  const { t, changeLanguage, language } = useI18n();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('email');
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [isLogin, setIsLogin] = useState(true);


  // Clear form data when switching between login and register
  const handleToggleMode = () => {
    setFormData({
      email: '',
      password: '',
      username: '',
      firstName: '',
      lastName: '',
      phone: '',
    });
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData);

      if (result.requiresTwoFactor) {
        setShowTwoFactor(true);
      } else {
        toast({
          title: t('auth.loginSuccess'),
          description: t('dashboard.welcome'),
        });
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('auth.loginError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    try {
      // Redirect to OAuth provider
      window.location.href = `/api/auth/oauth/${provider}`;
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Erro ao conectar com ' + provider,
        variant: 'destructive',
      });
    }
  };

  const languages = [
    { code: 'pt-BR', name: 'Português (BR)' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'ru', name: 'Русский' },
  ];

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
              <Wallet className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">OursPaay</h1>
            <p className="text-muted-foreground">Plataforma de Cobranças Profissional</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-center">
                {t('auth.welcome')}
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Entre com sua conta para continuar
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Login Method Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t('auth.email')}
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {t('auth.phone')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('auth.email')} *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.login}
                        onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                        required
                        data-testid="email-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">{t('auth.password')} *</Label>
                        <a href="#" className="text-xs text-primary hover:underline">
                          {t('auth.forgotPassword')}
                        </a>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          data-testid="password-input"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="toggle-password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, rememberMe: !!checked })
                        }
                        data-testid="remember-checkbox"
                      />
                      <Label htmlFor="remember" className="text-sm">
                        {t('auth.rememberMe')}
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                      data-testid="login-button"
                    >
                      {isLoading ? (
                        <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                      ) : null}
                      {t('auth.login')}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('auth.phone')} *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+55 (11) 99999-9999"
                        value={formData.login}
                        onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                        required
                        data-testid="phone-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone-password">{t('auth.password')} *</Label>
                      <div className="relative">
                        <Input
                          id="phone-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          data-testid="phone-password-input"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                      ) : null}
                      {t('auth.login')}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Toggle between login and register */}
              <div className="text-center space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-background text-muted-foreground">
                      {isLogin ? 'ou' : ''}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleToggleMode}
                >
                  {isLogin ? 'Criar Nova Conta' : 'Já tenho uma conta - Fazer Login'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Language Selector */}
          <div className="mt-6 text-center">
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-background text-foreground border border-border rounded-md px-3 py-1 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="language-selector"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-background text-foreground">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Two Factor Modal */}
      {showTwoFactor && (
        <TwoFactorModal
          isOpen={showTwoFactor}
          onClose={() => setShowTwoFactor(false)}
          onSuccess={() => {
            setShowTwoFactor(false);
            toast({
              title: t('auth.loginSuccess'),
              description: t('dashboard.welcome'),
            });
          }}
        />
      )}
    </>
  );
}