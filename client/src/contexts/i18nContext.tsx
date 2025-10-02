import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { initI18n } from '@/lib/i18n';
import { i18n } from 'i18next';

interface I18nContextType {
  i18n: i18n;
  language: string;
  changeLanguage: (lng: string) => void;
  t: (key: string, options?: any) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [i18nInstance, setI18nInstance] = useState<i18n | null>(null);
  const [language, setLanguage] = useState('pt-BR');

  useEffect(() => {
    const init = async () => {
      const instance = await initI18n();
      setI18nInstance(instance);
      setLanguage(instance.language);
    };
    init();
  }, []);

  const changeLanguage = async (lng: string) => {
    if (i18nInstance) {
      await i18nInstance.changeLanguage(lng);
      setLanguage(lng);
      
      // Save preference to localStorage
      localStorage.setItem('language', lng);
      
      // Update user preference in backend
      try {
        await fetch('/api/auth/update-language', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ language: lng }),
        });
      } catch (error) {
        console.error('Failed to update language preference:', error);
      }
    }
  };

  const t = (key: string, options?: any) => {
    return i18nInstance?.t(key, options) || key;
  };

  if (!i18nInstance) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  const value = {
    i18n: i18nInstance,
    language,
    changeLanguage,
    t,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
