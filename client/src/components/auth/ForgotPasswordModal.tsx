
import { useState } from 'react';
import { useI18n } from '@/contexts/i18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Phone, Mail, MessageSquare } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [step, setStep] = useState<'phone' | 'method' | 'code' | 'newPassword'>('phone');
  const [countryCode, setCountryCode] = useState('+55');
  const [phone, setPhone] = useState('');
  const [recoveryMethod, setRecoveryMethod] = useState<'sms' | 'call' | 'whatsapp'>('sms');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `${countryCode}${phone}` }),
      });

      if (!response.ok) throw new Error('Telefone não encontrado');

      toast({
        title: 'Telefone encontrado',
        description: 'Escolha o método de recuperação',
      });
      setStep('method');
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || 'Erro ao verificar telefone',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: `${countryCode}${phone}`, 
          method: recoveryMethod 
        }),
      });

      if (!response.ok) throw new Error('Erro ao enviar código');

      toast({
        title: 'Código enviado',
        description: `Código de recuperação enviado via ${recoveryMethod.toUpperCase()}`,
      });
      setStep('code');
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || 'Erro ao enviar código',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: `${countryCode}${phone}`, 
          code 
        }),
      });

      if (!response.ok) throw new Error('Código inválido');

      toast({
        title: 'Código verificado',
        description: 'Digite sua nova senha',
      });
      setStep('newPassword');
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || 'Código inválido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: t('common.error'),
        description: 'As senhas não coincidem',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: t('common.error'),
        description: 'A senha deve ter pelo menos 8 caracteres',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: `${countryCode}${phone}`, 
          code,
          newPassword 
        }),
      });

      if (!response.ok) throw new Error('Erro ao redefinir senha');

      toast({
        title: 'Senha redefinida',
        description: 'Sua senha foi alterada com sucesso',
      });
      
      onClose();
      setStep('phone');
      setPhone('');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || 'Erro ao redefinir senha',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Recuperar Senha
          </DialogTitle>
          <DialogDescription>
            {step === 'phone' && 'Digite seu número de telefone cadastrado'}
            {step === 'method' && 'Escolha como deseja receber o código'}
            {step === 'code' && 'Digite o código de recuperação'}
            {step === 'newPassword' && 'Digite sua nova senha'}
          </DialogDescription>
        </DialogHeader>

        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue>
                      {countryCodes.find(c => c.code === countryCode)?.flag || '🇧🇷'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span className="text-xl">{country.flag}</span>
                          <span className="text-xs">{country.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="flex-1"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Continuar'}
            </Button>
          </form>
        )}

        {step === 'method' && (
          <form onSubmit={handleMethodSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Método de Recuperação</Label>
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant={recoveryMethod === 'sms' ? 'default' : 'outline'}
                  onClick={() => setRecoveryMethod('sms')}
                  className="w-full justify-start"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS
                </Button>
                <Button
                  type="button"
                  variant={recoveryMethod === 'call' ? 'default' : 'outline'}
                  onClick={() => setRecoveryMethod('call')}
                  className="w-full justify-start"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Chamada
                </Button>
                <Button
                  type="button"
                  variant={recoveryMethod === 'whatsapp' ? 'default' : 'outline'}
                  onClick={() => setRecoveryMethod('whatsapp')}
                  className="w-full justify-start"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar Código'}
            </Button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Recuperação</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </Button>
          </form>
        )}

        {step === 'newPassword' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Redefinir Senha'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
