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

              {/* OAuth Buttons */}
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-background text-muted-foreground">ou continue com</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthLogin('google')}
                    data-testid="google-login"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthLogin('facebook')}
                    data-testid="facebook-login"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>

              {/* Sign up link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Não tem uma conta?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal text-primary"
                    onClick={handleToggleMode}
                  >
                    {isLogin ? t('auth.register') : t('auth.login')}
                  </Button>
                </p>
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