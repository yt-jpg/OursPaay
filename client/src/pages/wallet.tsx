import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import WalletPage from '@/components/wallet/WalletPage';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

export default function WalletPageContainer() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/auth');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="ml-70 transition-all duration-300">
        <Header className="sticky top-0 z-30" />
        
        <main className="p-6">
          <WalletPage />
        </main>
      </div>
    </div>
  );
}
