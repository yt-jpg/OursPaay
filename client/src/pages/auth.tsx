import { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import ContractModal from '@/components/auth/ContractModal';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/contexts/i18nContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const languages = [
  { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷', countryCode: '+55' },
  { code: 'en', name: 'English', flag: '🇺🇸', countryCode: '+1' },
  { code: 'es', name: 'Español', flag: '🇪🇸', countryCode: '+34' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', countryCode: '+7' },
];

export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showContracts, setShowContracts] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage } = useI18n();

  useEffect(() => {
    if (isAuthenticated) {
      const hasAcceptedContracts = localStorage.getItem('contractsAccepted');

      if (!hasAcceptedContracts) {
        setShowContracts(true);
      } else {
        setLocation('/dashboard');
      }
    }
  }, [isAuthenticated, setLocation]);

  const handleContractsAccepted = () => {
    localStorage.setItem('contractsAccepted', 'true');
    setShowContracts(false);
    setLocation('/dashboard');
  };

  // Security: Disable developer tools on auth page
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'K')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  if (isAuthenticated && showContracts) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50 flex gap-3">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full relative theme-toggle-glow transition-all duration-300 hover:scale-110"
              >
                <span className="text-xl">{currentLanguage.flag}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                  {language === lang.code && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full relative theme-toggle-glow transition-all duration-300 hover:scale-110"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-blue-600" />
            )}
          </Button>
        </div>
        <ContractModal
          isOpen={showContracts}
          onClose={() => setShowContracts(false)}
          onSuccess={handleContractsAccepted}
        />
      </>
    );
  }

  return (
    <>
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="auth-background"></div>
        <div className="auth-gradient-orb auth-orb-1"></div>
        <div className="auth-gradient-orb auth-orb-2"></div>
        <div className="auth-gradient-orb auth-orb-3"></div>
      </div>

      {/* Control Buttons */}
      <div className="fixed top-4 right-4 z-50 flex gap-3">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full relative theme-toggle-glow transition-all duration-300 hover:scale-110 bg-background/80 backdrop-blur-sm"
            >
              <span className="text-2xl">{currentLanguage.flag}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm border-border">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className="flex items-center gap-2 cursor-pointer hover:bg-muted text-foreground"
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-foreground">{lang.name}</span>
                {language === lang.code && <span className="ml-auto text-primary font-bold">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full relative theme-toggle-glow transition-all duration-300 hover:scale-110 bg-background/80 backdrop-blur-sm"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-amber-500" />
          ) : (
            <Moon className="h-5 w-5 text-blue-600" />
          )}
        </Button>
      </div>

      <LoginForm currentLanguage={currentLanguage} />
    </>
  );
}