
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TwoFactorModal from './TwoFactorModal';

interface Language {
  code: string;
  name: string;
  flag: string;
  countryCode: string;
}

interface LoginFormProps {
  currentLanguage: Language;
}

const countryCodes = [
  { flag: '🇧🇷', code: '+55', country: 'Brasil' },
  { flag: '🇺🇸', code: '+1', country: 'USA' },
  { flag: '🇪🇸', code: '+34', country: 'España' },
  { flag: '🇷🇺', code: '+7', country: 'Россия' },
  { flag: '🇵🇹', code: '+351', country: 'Portugal' },
  { flag: '🇲🇽', code: '+52', country: 'México' },
  { flag: '🇦🇷', code: '+54', country: 'Argentina' },
  { flag: '🇬🇧', code: '+44', country: 'UK' },
];

export default function LoginForm({ currentLanguage }: LoginFormProps) {
  const { login } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('email');
  const [isRegister, setIsRegister] = useState(false);
  const [countryCode, setCountryCode] = useState(currentLanguage.countryCode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    username: '',
    firstName: '',
    lastName: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  // Update country code when language changes
  useState(() => {
    setCountryCode(currentLanguage.countryCode);
  });

  const handleToggleMode = () => {
    setFormData({
      email: '',
      password: '',
      phone: '',
      username: '',
      firstName: '',
      lastName: '',
      rememberMe: false,
    });
    setIsRegister(!isRegister);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginData = activeTab === 'phone' 
        ? { login: `${countryCode}${formData.phone}`, password: formData.password, rememberMe: formData.rememberMe }
        : { login: formData.email, password: formData.password, rememberMe: formData.rememberMe };

      const result = await login(loginData);

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
      window.location.href = `/api/auth/oauth/${provider}`;
    } catch (error) {
      toast({
        title: t('common.error'),
        description: `Erro ao conectar com ${provider}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
              <Wallet className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">OursPaay</h1>
            <p className="text-muted-foreground">{t('auth.welcome')}</p>
          </div>

          {/* Login/Register Card */}
          <Card className="shadow-xl border border-border bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-center">
                {isRegister ? t('auth.createAccount') : t('auth.login')}
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                {isRegister ? 'Crie sua conta para começar' : 'Entre com sua conta para continuar'}
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

                {/* Email Tab */}
                <TabsContent value="email" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">{t('auth.firstName')} *</Label>
                            <Input
                              id="firstName"
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              required={isRegister}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">{t('auth.lastName')} *</Label>
                            <Input
                              id="lastName"
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              required={isRegister}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">{t('auth.username')} *</Label>
                          <Input
                            id="username"
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required={isRegister}
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('auth.email')} *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        data-testid="email-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">{t('auth.password')} *</Label>
                        {!isRegister && (
                          <a href="#" className="text-xs text-primary hover:underline">
                            {t('auth.forgotPassword')}
                          </a>
                        )}
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

                    {!isRegister && (
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
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                      data-testid="submit-button"
                    >
                      {isLoading ? (
                        <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                      ) : null}
                      {isRegister ? t('auth.register') : t('auth.login')}
                    </Button>
                  </form>
                </TabsContent>

                {/* Phone Tab */}
                <TabsContent value="phone" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName-phone">{t('auth.firstName')} *</Label>
                            <Input
                              id="firstName-phone"
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              required={isRegister}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName-phone">{t('auth.lastName')} *</Label>
                            <Input
                              id="lastName-phone"
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              required={isRegister}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username-phone">{t('auth.username')} *</Label>
                          <Input
                            id="username-phone"
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required={isRegister}
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('auth.phone')} *</Label>
                      <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {countryCodes.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                <span className="flex items-center gap-2">
                                  <span>{country.flag}</span>
                                  <span>{country.code}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          data-testid="phone-input"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="phone-password">{t('auth.password')} *</Label>
                        {!isRegister && (
                          <a href="#" className="text-xs text-primary hover:underline">
                            {t('auth.forgotPassword')}
                          </a>
                        )}
                      </div>
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

                    {!isRegister && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-phone"
                          checked={formData.rememberMe}
                          onCheckedChange={(checked) => 
                            setFormData({ ...formData, rememberMe: !!checked })
                          }
                        />
                        <Label htmlFor="remember-phone" className="text-sm">
                          {t('auth.rememberMe')}
                        </Label>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                      ) : null}
                      {isRegister ? t('auth.register') : t('auth.login')}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* OAuth Buttons */}
              {!isRegister && (
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-muted-foreground">ou continue com</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
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
              )}

              {/* Toggle between login and register */}
              <div className="text-center space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">
                      {isRegister ? '' : 'ou'}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleToggleMode}
                >
                  {isRegister ? t('auth.hasAccount') + ' - ' + t('auth.login') : t('auth.noAccount') + ' - ' + t('auth.register')}
                </Button>
              </div>
            </CardContent>
          </Card>
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
