
import { useState } from 'react';
import { useI18n } from '@/contexts/i18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert } from 'lucide-react';

interface TwoFactorRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TwoFactorRecoveryModal({ isOpen, onClose }: TwoFactorRecoveryModalProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/support/2fa-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, description }),
      });

      if (!response.ok) throw new Error('Erro ao enviar ticket');

      toast({
        title: 'Ticket enviado',
        description: 'Nossa equipe entrará em contato em breve',
      });
      
      onClose();
      setEmail('');
      setPhone('');
      setDescription('');
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || 'Erro ao enviar ticket',
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
          <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8 text-warning" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Recuperação de 2FA
          </DialogTitle>
          <DialogDescription>
            Perdeu acesso ao seu código 2FA? Envie um ticket para nosso suporte
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail Cadastrado *</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone Cadastrado *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descreva o Problema *</Label>
            <Textarea
              id="description"
              placeholder="Ex: Perdi meu celular e não tenho mais acesso ao código 2FA..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
            <p className="font-semibold mb-1">⚠️ Importante:</p>
            <p>Nossa equipe verificará sua identidade antes de remover o 2FA. Este processo pode levar até 48 horas.</p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar Ticket de Suporte'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
