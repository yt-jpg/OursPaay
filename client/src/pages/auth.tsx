import { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import ContractModal from '@/components/auth/ContractModal';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showContracts, setShowContracts] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Check if user needs to accept contracts
      // In a real app, this would be determined by backend
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
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+K
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

  if (isAuthenticated && showContracts) {
    return (
      <ContractModal
        isOpen={showContracts}
        onClose={() => setShowContracts(false)}
        onSuccess={handleContractsAccepted}
      />
    );
  }

  return <LoginForm />;
}
