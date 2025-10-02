import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  'pt-BR': {
    translation: {
      // Common
      'common.save': 'Salvar',
      'common.cancel': 'Cancelar',
      'common.delete': 'Excluir',
      'common.edit': 'Editar',
      'common.close': 'Fechar',
      'common.loading': 'Carregando...',
      'common.error': 'Erro',
      'common.success': 'Sucesso',
      'common.warning': 'Aviso',
      'common.search': 'Pesquisar',
      'common.filter': 'Filtrar',
      'common.export': 'Exportar',
      'common.download': 'Baixar',
      'common.upload': 'Enviar',
      'common.actions': 'Ações',
      'common.status': 'Status',
      'common.amount': 'Valor',
      'common.date': 'Data',
      'common.description': 'Descrição',

      // Auth
      'auth.login': 'Entrar',
      'auth.register': 'Cadastrar',
      'auth.logout': 'Sair',
      'auth.email': 'E-mail',
      'auth.password': 'Senha',
      'auth.username': 'Nome de usuário',
      'auth.firstName': 'Primeiro nome',
      'auth.lastName': 'Sobrenome',
      'auth.phone': 'Telefone',
      'auth.forgotPassword': 'Esqueceu a senha?',
      'auth.rememberMe': 'Lembrar-me',
      'auth.noAccount': 'Não tem uma conta?',
      'auth.hasAccount': 'Já tem uma conta?',
      'auth.welcome': 'Bem-vindo de volta',
      'auth.createAccount': 'Criar conta',
      'auth.loginSuccess': 'Login realizado com sucesso',
      'auth.loginError': 'Credenciais inválidas',
      'auth.2fa.title': 'Autenticação de Dois Fatores',
      'auth.2fa.description': 'Digite o código de 6 dígitos do seu aplicativo autenticador',
      'auth.2fa.verify': 'Verificar',
      'auth.2fa.backup': 'Usar código de backup',

      // Dashboard
      'dashboard.title': 'Dashboard',
      'dashboard.overview': 'Visão geral das suas operações financeiras',
      'dashboard.totalRevenue': 'Receita Total',
      'dashboard.activeCharges': 'Cobranças Ativas',
      'dashboard.conversionRate': 'Taxa de Conversão',
      'dashboard.walletBalance': 'Saldo em Carteira',
      'dashboard.monthlyRevenue': 'Receita Mensal',
      'dashboard.paymentMethods': 'Métodos de Pagamento',
      'dashboard.recentTransactions': 'Transações Recentes',
      'dashboard.quickActions': 'Ações Rápidas',
      'dashboard.systemAlerts': 'Alertas do Sistema',
      'dashboard.newCharge': 'Nova Cobrança',
      'dashboard.importBatch': 'Importar Lote',
      'dashboard.exportData': 'Exportar Dados',
      'dashboard.newClient': 'Novo Cliente',

      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.charges': 'Cobranças',
      'nav.payments': 'Pagamentos',
      'nav.wallet': 'Carteira Digital',
      'nav.referrals': 'Indicações',
      'nav.users': 'Usuários',
      'nav.reports': 'Relatórios',
      'nav.audit': 'Auditoria',
      'nav.contracts': 'Contratos',
      'nav.support': 'Suporte',
      'nav.settings': 'Configurações',

      // Charges
      'charges.title': 'Cobranças',
      'charges.create': 'Criar Cobrança',
      'charges.number': 'Número',
      'charges.creditor': 'Credor',
      'charges.debtor': 'Devedor',
      'charges.originalAmount': 'Valor Original',
      'charges.currentAmount': 'Valor Atual',
      'charges.dueDate': 'Vencimento',
      'charges.status.pending': 'Pendente',
      'charges.status.paid': 'Pago',
      'charges.status.overdue': 'Vencido',
      'charges.status.cancelled': 'Cancelado',
      'charges.recurrent': 'Recorrente',
      'charges.installments': 'Parcelas',

      // Payments
      'payments.title': 'Pagamentos',
      'payments.method': 'Método',
      'payments.pix': 'PIX',
      'payments.creditCard': 'Cartão de Crédito',
      'payments.boleto': 'Boleto',
      'payments.ted': 'TED/DOC',
      'payments.crypto': 'Criptomoeda',
      'payments.receipt': 'Comprovante',
      'payments.confirmation': 'Confirmação',

      // Wallet
      'wallet.title': 'Carteira Digital',
      'wallet.balance': 'Saldo Disponível',
      'wallet.cashback': 'Cashback Acumulado',
      'wallet.referralBonus': 'Bônus de Indicação',
      'wallet.totalCharges': 'Total em Cobranças',
      'wallet.addFunds': 'Adicionar Fundos',
      'wallet.withdraw': 'Sacar',
      'wallet.transfer': 'Transferir',
      'wallet.transactions': 'Transações',
      'wallet.statement': 'Extrato',

      // Referrals
      'referrals.title': 'Programa de Indicações',
      'referrals.subtitle': 'Indique amigos e ganhe recompensas por cada cadastro confirmado',
      'referrals.code': 'Seu Código de Indicação',
      'referrals.share': 'Compartilhar',
      'referrals.copy': 'Copiar',
      'referrals.total': 'Total de Indicações',
      'referrals.active': 'Indicações Ativas',
      'referrals.bonus': 'Bônus Ganho',
      'referrals.level': 'Nível',
      'referrals.history': 'Histórico de Indicações',
      'referrals.status.pending': 'Pendente',
      'referrals.status.active': 'Ativa',
      'referrals.status.blocked': 'Bloqueada',

      // Chat
      'chat.title': 'Chat',
      'chat.conversations': 'Conversas',
      'chat.newConversation': 'Nova Conversa',
      'chat.typing': 'digitando...',
      'chat.online': 'Online',
      'chat.offline': 'Offline',
      'chat.attachFile': 'Anexar arquivo',
      'chat.sendMessage': 'Enviar mensagem',
      'chat.aiAssistant': 'Assistente IA',
      'chat.humanSupport': 'Suporte Humano',

      // Notifications
      'notifications.title': 'Notificações',
      'notifications.markAllRead': 'Marcar todas como lidas',
      'notifications.noNotifications': 'Nenhuma notificação',
      'notifications.new': 'Nova',
      'notifications.read': 'Lida',

      // Settings
      'settings.title': 'Configurações',
      'settings.profile': 'Perfil',
      'settings.security': 'Segurança',
      'settings.notifications': 'Notificações',
      'settings.language': 'Idioma',
      'settings.theme': 'Tema',
      'settings.2fa': 'Autenticação de Dois Fatores',
      'settings.sessions': 'Sessões Ativas',

      // Contracts
      'contracts.title': 'Aceite de Contratos',
      'contracts.subtitle': 'Leia atentamente e aceite os contratos antes de prosseguir',
      'contracts.service': 'Contrato de Prestação de Serviços',
      'contracts.terms': 'Termos de Uso da Plataforma',
      'contracts.privacy': 'Política de Privacidade',
      'contracts.accept': 'Aceitar e Continuar',
      'contracts.download': 'Baixar PDF',
      'contracts.immutableRecord': 'Registro Imutável',
      'contracts.immutableDescription': 'Seu aceite será registrado com hash criptográfico, data/hora, endereço IP e identificação do dispositivo para fins de auditoria e conformidade legal.',

      // Error Messages
      'errors.networkError': 'Erro de conexão. Tente novamente.',
      'errors.invalidCredentials': 'Credenciais inválidas',
      'errors.sessionExpired': 'Sessão expirada. Faça login novamente.',
      'errors.accessDenied': 'Acesso negado',
      'errors.serverError': 'Erro interno do servidor',
      'errors.validation': 'Dados inválidos',
      'errors.required': 'Este campo é obrigatório',
      'errors.email': 'E-mail inválido',
      'errors.phone': 'Telefone inválido',
      'errors.password': 'Senha deve ter pelo menos 8 caracteres',

      // Success Messages
      'success.saved': 'Salvo com sucesso',
      'success.created': 'Criado com sucesso',
      'success.updated': 'Atualizado com sucesso',
      'success.deleted': 'Excluído com sucesso',
      'success.sent': 'Enviado com sucesso',
      'success.copied': 'Copiado para a área de transferência',
    }
  },
  'en': {
    translation: {
      // Common
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.close': 'Close',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.warning': 'Warning',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.export': 'Export',
      'common.download': 'Download',
      'common.upload': 'Upload',
      'common.actions': 'Actions',
      'common.status': 'Status',
      'common.amount': 'Amount',
      'common.date': 'Date',
      'common.description': 'Description',

      // Auth
      'auth.login': 'Sign In',
      'auth.register': 'Sign Up',
      'auth.logout': 'Sign Out',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.username': 'Username',
      'auth.firstName': 'First Name',
      'auth.lastName': 'Last Name',
      'auth.phone': 'Phone',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.rememberMe': 'Remember Me',
      'auth.noAccount': "Don't have an account?",
      'auth.hasAccount': 'Already have an account?',
      'auth.welcome': 'Welcome back',
      'auth.createAccount': 'Create Account',
      'auth.loginSuccess': 'Login successful',
      'auth.loginError': 'Invalid credentials',
      'auth.2fa.title': 'Two-Factor Authentication',
      'auth.2fa.description': 'Enter the 6-digit code from your authenticator app',
      'auth.2fa.verify': 'Verify',
      'auth.2fa.backup': 'Use backup code',

      // Dashboard
      'dashboard.title': 'Dashboard',
      'dashboard.overview': 'Overview of your financial operations',
      'dashboard.totalRevenue': 'Total Revenue',
      'dashboard.activeCharges': 'Active Charges',
      'dashboard.conversionRate': 'Conversion Rate',
      'dashboard.walletBalance': 'Wallet Balance',
      'dashboard.monthlyRevenue': 'Monthly Revenue',
      'dashboard.paymentMethods': 'Payment Methods',
      'dashboard.recentTransactions': 'Recent Transactions',
      'dashboard.quickActions': 'Quick Actions',
      'dashboard.systemAlerts': 'System Alerts',
      'dashboard.newCharge': 'New Charge',
      'dashboard.importBatch': 'Import Batch',
      'dashboard.exportData': 'Export Data',
      'dashboard.newClient': 'New Client',

      // Continue with other translations...
    }
  },
  'es': {
    translation: {
      // Spanish translations...
      'common.save': 'Guardar',
      'common.cancel': 'Cancelar',
      'auth.login': 'Iniciar Sesión',
      'dashboard.title': 'Tablero',
      // Add more translations as needed
    }
  },
  'ru': {
    translation: {
      // Russian translations...
      'common.save': 'Сохранить',
      'common.cancel': 'Отмена',
      'auth.login': 'Войти',
      'dashboard.title': 'Панель управления',
      // Add more translations as needed
    }
  }
};

export const initI18n = async () => {
  const savedLanguage = localStorage.getItem('language') || 'pt-BR';
  
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage,
      fallbackLng: 'pt-BR',
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
    });

  return i18n;
};

export default i18n;
