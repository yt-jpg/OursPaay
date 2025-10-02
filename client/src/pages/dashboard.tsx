import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Dashboard from '@/components/dashboard/Dashboard';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/auth');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  useEffect(() => {
    // Load sidebar state from localStorage
    const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    setSidebarCollapsed(savedCollapsed);
  }, []);

  const handleSidebarToggle = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
  };

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
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-70'
      }`}>
        <Header 
          className="sticky top-0 z-30"
          onNotificationClick={() => setShowNotifications(true)}
        />
        
        <main className="p-6">
          <Dashboard />
        </main>
      </div>

      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
}
