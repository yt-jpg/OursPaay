import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
<<<<<<< HEAD
import session from "express-session";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { storage } from "./storage";
import { authService } from "./services/auth";
import { paymentsService } from "./services/payments";
import { aiChatService } from "./services/ai-chat";
import { notificationService } from "./services/notifications";
import { insertUserSchema, insertChargeSchema, insertPaymentSchema } from "@shared/schema";

// Assuming db and users are imported or defined elsewhere for the new routes.
// For demonstration purposes, let's mock them.
const db = {
  select: () => ({ from: (table: any) => ({ where: (condition: any) => ({ limit: (num: number) => [] }) }) }),
  update: () => ({ set: (data: any) => ({ where: (condition: any) => {} }) }),
};
const users = { phone: 'phone' }; // Mock users table structure for eq
const eq = (a: string, b: string) => `${a} = ${b}`; // Mock eq function
const hash = bcrypt.hash; // Use actual bcrypt hash function

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
  }));

  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const connectedClients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    const userId = req.url?.split('userId=')[1];
    if (userId) {
      connectedClients.set(userId, ws);
      console.log(`WebSocket connected for user: ${userId}`);
    }

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        await handleWebSocketMessage(data, ws, userId);
=======
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBillingSchema, insertMessageSchema, insertNotificationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // WebSocket for real-time chat and notifications
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store WebSocket connections by user ID
  const connections = new Map<string, WebSocket>();
  
  wss.on('connection', (ws, request) => {
    let userId: string = '';
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          userId = message.userId;
          connections.set(userId, ws);
        } else if (message.type === 'chat_message' && userId) {
          // Handle chat message
          const newMessage = await storage.createMessage({
            billingId: message.billingId,
            senderId: userId,
            receiverId: message.receiverId,
            content: message.content,
          });
          
          // Send to receiver if online
          const receiverWs = connections.get(message.receiverId);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({
              type: 'chat_message',
              message: newMessage,
            }));
          }
        }
>>>>>>> a757380dbfe2d95040e42f9db40e45de5910a0af
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
<<<<<<< HEAD

    ws.on('close', () => {
      if (userId) {
        connectedClients.delete(userId);
        console.log(`WebSocket disconnected for user: ${userId}`);
=======
    
    ws.on('close', () => {
      if (userId && userId !== '') {
        connections.delete(userId);
>>>>>>> a757380dbfe2d95040e42f9db40e45de5910a0af
      }
    });
  });

<<<<<<< HEAD
  // Forgot password routes
  app.post('/api/auth/forgot-password/phone', async (req, res) => {
    try {
      const { phone } = req.body;
      // In a real application, 'db' and 'users' would be properly imported and configured.
      // This is a placeholder to integrate the provided change snippet.
      const user = await db.select().from(users).where(eq(users.phone, phone)).limit(1);

      if (user.length === 0) {
        return res.status(404).json({ message: 'Telefone não encontrado' });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/auth/forgot-password/send-code', async (req, res) => {
    try {
      const { phone, method } = req.body;
      // TODO: Implement actual code sending via SMS/Call/WhatsApp
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Store code temporarily (in production, use Redis or similar)
      // For now, we'll just log it
      console.log(`Recovery code for ${phone}: ${code} via ${method}`);

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/auth/forgot-password/verify-code', async (req, res) => {
    try {
      const { phone, code } = req.body;
      // TODO: Verify code from temporary storage
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/auth/forgot-password/reset', async (req, res) => {
    try {
      const { phone, code, newPassword } = req.body;
      // TODO: Verify code and update password
      const hashedPassword = await hash(newPassword, 10);

      // In a real application, 'db' and 'users' would be properly imported and configured.
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.phone, phone));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // 2FA Recovery support ticket
  app.post('/api/support/2fa-recovery', async (req, res) => {
    try {
      const { email, phone, description } = req.body;
      // TODO: Create support ticket in database
      console.log('2FA Recovery Ticket:', { email, phone, description });

      res.json({ success: true, ticketId: Date.now() });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Create session
      const sessionId = await storage.createSession(
        user.id,
        req.ip,
        req.get('User-Agent')
      );

      req.session.userId = user.id;
      req.session.sessionId = sessionId;

      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { login, password, twoFactorCode } = req.body;

      // Find user by email or username
      let user = await storage.getUserByEmail(login);
      if (!user) {
        user = await storage.getUserByUsername(login);
      }

      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Conta desativada" });
      }

      // Check 2FA if enabled
      if (user.twoFactorEnabled) {
        if (!twoFactorCode) {
          return res.json({ requiresTwoFactor: true });
        }

        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret!,
          encoding: 'base32',
          token: twoFactorCode,
          window: 2,
        });

        if (!verified) {
          return res.status(401).json({ message: "Código 2FA inválido" });
        }
      }

      // Create session
      const sessionId = await storage.createSession(
        user.id,
        req.ip,
        req.get('User-Agent')
      );

      req.session.userId = user.id;
      req.session.sessionId = sessionId;

      // Create audit log
      await storage.createAuditLog({
        userId: user.id,
        action: 'login',
        resource: 'auth',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    if (req.session.sessionId) {
      await storage.deleteSession(req.session.userId!); // Corrected to use userId from session
    }
    req.session.destroy(() => {
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  // 2FA routes
  app.post("/api/auth/setup-2fa", authMiddleware, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

      const secret = speakeasy.generateSecret({
        name: `OursPaay (${user.email})`,
        issuer: 'OursPaay',
      });

      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      res.json({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        backupCodes: authService.generateBackupCodes(),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/verify-2fa", authMiddleware, async (req, res) => {
    try {
      const { secret, token } = req.body;

      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (!verified) {
        return res.status(400).json({ message: "Código inválido" });
      }

      const backupCodes = authService.generateBackupCodes();

      await storage.updateUser(req.session.userId!, {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: JSON.stringify(backupCodes),
      });

      res.json({ 
        message: "2FA ativado com sucesso",
        backupCodes 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Contract routes
  app.post("/api/contracts/accept", authMiddleware, async (req, res) => {
    try {
      const { contractType, contractVersion, acceptances } = req.body;

      const cryptoHash = authService.generateContractHash({
        userId: req.session.userId!,
        contractType,
        contractVersion,
        timestamp: Date.now(),
      });

      await storage.recordContractAcceptance({
        userId: req.session.userId!,
        contractType,
        contractVersion,
        ipAddress: req.ip || '',
        userAgent: req.get('User-Agent') || '',
        deviceFingerprint: req.get('X-Device-Fingerprint') || '',
        cryptoHash,
      });

      res.json({ message: "Contratos aceitos com sucesso" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", authMiddleware, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.session.userId!);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Charges routes
  app.get("/api/charges", authMiddleware, async (req, res) => {
    try {
      const charges = await storage.getCharges(req.session.userId!);
      res.json(charges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/charges", authMiddleware, async (req, res) => {
    try {
      const chargeData = insertChargeSchema.parse({
        ...req.body,
        creditorId: req.session.userId!,
      });

      const charge = await storage.createCharge(chargeData);

      // Send notification to debtor
      await notificationService.sendNotification(charge.debtorId, {
        type: 'charge_created',
        title: 'Nova cobrança recebida',
        content: `Você recebeu uma nova cobrança no valor de R$ ${charge.originalAmount}`,
        data: { chargeId: charge.id },
      });

      res.json(charge);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Payment routes
  app.post("/api/payments", authMiddleware, async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse({
        ...req.body,
        payerId: req.session.userId!,
      });

      const payment = await paymentsService.processPayment(paymentData);
      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Wallet routes
  app.get("/api/wallet", authMiddleware, async (req, res) => {
    try {
      const wallet = await storage.getWallet(req.session.userId!);
      const transactions = await storage.getWalletTransactions(wallet.id);

      res.json({
        ...wallet,
        transactions: transactions.slice(0, 10), // Recent transactions
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wallet/withdraw", authMiddleware, async (req, res) => {
    try {
      const { amount, method, bankData } = req.body;

      const wallet = await storage.getWallet(req.session.userId!);

      if (parseFloat(wallet.balance) < amount) {
        return res.status(400).json({ message: "Saldo insuficiente" });
      }

      // Process withdrawal
      const updatedWallet = await storage.updateWalletBalance(
        req.session.userId!,
        -amount,
        'withdrawal'
      );

      res.json({
        message: "Saque processado com sucesso",
        wallet: updatedWallet,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Referrals routes
  app.get("/api/referrals", authMiddleware, async (req, res) => {
    try {
      const referrals = await storage.getReferrals(req.session.userId!);
      res.json(referrals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Chat routes
  app.get("/api/chat/conversations", authMiddleware, async (req, res) => {
    try {
      const conversations = await storage.getConversations(req.session.userId!);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chat/messages/:conversationId", authMiddleware, async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/chat/ai", authMiddleware, async (req, res) => {
    try {
      const { message, conversationId } = req.body;

      // Save user message
      await storage.createMessage({
        conversationId,
        senderId: req.session.userId!,
        senderType: 'user',
        content: message,
        messageType: 'text',
      });

      // Get AI response
      const aiResponse = await aiChatService.generateResponse(message, req.session.userId!);

      // Save AI message
      const aiMessage = await storage.createMessage({
        conversationId,
        senderType: 'ai',
        content: aiResponse.content,
        messageType: 'text',
        aiContext: aiResponse.context,
      });

      // Send via WebSocket if user is connected
      const userWs = connectedClients.get(req.session.userId!);
      if (userWs && userWs.readyState === WebSocket.OPEN) {
        userWs.send(JSON.stringify({
          type: 'new_message',
          message: aiMessage,
        }));
      }

      res.json(aiMessage);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Notifications routes
  app.get("/api/notifications", authMiddleware, async (req, res) => {
    try {
      const notifications = await storage.getNotifications(req.session.userId!);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/notifications/:id/read", authMiddleware, async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ message: "Notificação marcada como lida" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Helper function for WebSocket message handling
  async function handleWebSocketMessage(data: any, ws: WebSocket, userId?: string) {
    switch (data.type) {
      case 'chat_message':
        if (userId) {
          const message = await storage.createMessage({
            conversationId: data.conversationId,
            senderId: userId,
            senderType: 'user',
            content: data.content,
            messageType: 'text',
          });

          // Broadcast to conversation participants
          // Implementation would iterate through participants and send message
        }
        break;
      case 'typing':
        // Handle typing indicators
        break;
    }
  }

  // Auth middleware
  async function authMiddleware(req: any, res: any, next: any) {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    // Validate session
    if (req.session.sessionId) {
      const user = await storage.validateSession(req.session.sessionId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Sessão inválida" });
      }
    }

    next();
  }

  return httpServer;
}
=======
  // Helper function to send real-time notifications
  const sendNotification = async (userId: string, notification: any) => {
    const ws = connections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'notification',
        notification,
      }));
    }
  };

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Terms acceptance
  app.post('/api/auth/accept-terms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { termsVersion, ipAddress, userAgent } = req.body;
      
      const user = await storage.updateUser(userId, {
        termsAcceptedAt: new Date(),
        termsAcceptanceIp: ipAddress,
        termsAcceptanceDevice: userAgent,
        termsVersion,
      });

      // Log the acceptance
      await storage.createAuditLog({
        userId,
        action: 'TERMS_ACCEPTED',
        entityType: 'USER',
        entityId: userId,
        newValues: { termsVersion, ipAddress, userAgent },
        ipAddress,
        userAgent,
      });

      res.json({ success: true, user });
    } catch (error) {
      console.error("Error accepting terms:", error);
      res.status(500).json({ message: "Failed to accept terms" });
    }
  });

  // User profile
  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      const oldUser = await storage.getUser(userId);
      const user = await storage.updateUser(userId, updateData);

      // Log the profile update
      await storage.createAuditLog({
        userId,
        action: 'PROFILE_UPDATED',
        entityType: 'USER',
        entityId: userId,
        oldValues: oldUser,
        newValues: updateData,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Billings
  app.post('/api/billings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const billingData = insertBillingSchema.parse({
        ...req.body,
        creditorId: userId,
      });

      const billing = await storage.createBilling(billingData);

      // Create notification for debtor if they exist in system
      if (billing.debtorId) {
        const notification = await storage.createNotification({
          userId: billing.debtorId,
          type: 'billing_created',
          title: 'Nova Cobrança Recebida',
          message: `Você recebeu uma nova cobrança de R$ ${billing.amount}`,
          billingId: billing.id,
        });

        await sendNotification(billing.debtorId, notification);
      }

      // Log the billing creation
      await storage.createAuditLog({
        userId,
        action: 'BILLING_CREATED',
        entityType: 'BILLING',
        entityId: billing.id,
        newValues: billing,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json(billing);
    } catch (error) {
      console.error("Error creating billing:", error);
      res.status(500).json({ message: "Failed to create billing" });
    }
  });

  app.get('/api/billings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const type = req.query.type; // 'creditor' or 'debtor'
      
      let billings;
      if (type === 'debtor') {
        billings = await storage.getBillingsByDebtor(userId);
      } else {
        billings = await storage.getBillingsByCreditor(userId);
      }

      res.json(billings);
    } catch (error) {
      console.error("Error fetching billings:", error);
      res.status(500).json({ message: "Failed to fetch billings" });
    }
  });

  app.get('/api/billings/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getBillingsStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching billing stats:", error);
      res.status(500).json({ message: "Failed to fetch billing stats" });
    }
  });

  app.put('/api/billings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const billingId = req.params.id;
      const updateData = req.body;

      const oldBilling = await storage.getBilling(billingId);
      if (!oldBilling || oldBilling.creditorId !== userId) {
        return res.status(404).json({ message: "Billing not found" });
      }

      const billing = await storage.updateBilling(billingId, updateData);

      // Log the billing update
      await storage.createAuditLog({
        userId,
        action: 'BILLING_UPDATED',
        entityType: 'BILLING',
        entityId: billingId,
        oldValues: oldBilling,
        newValues: updateData,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json(billing);
    } catch (error) {
      console.error("Error updating billing:", error);
      res.status(500).json({ message: "Failed to update billing" });
    }
  });

  app.delete('/api/billings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const billingId = req.params.id;

      const billing = await storage.getBilling(billingId);
      if (!billing || billing.creditorId !== userId) {
        return res.status(404).json({ message: "Billing not found" });
      }

      await storage.deleteBilling(billingId);

      // Log the billing deletion
      await storage.createAuditLog({
        userId,
        action: 'BILLING_DELETED',
        entityType: 'BILLING',
        entityId: billingId,
        oldValues: billing,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting billing:", error);
      res.status(500).json({ message: "Failed to delete billing" });
    }
  });

  // Messages
  app.get('/api/billings/:billingId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const billingId = req.params.billingId;
      const messages = await storage.getMessagesByBilling(billingId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/billings/:billingId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const billingId = req.params.billingId;
      const { content, receiverId } = req.body;

      const message = await storage.createMessage({
        billingId,
        senderId: userId,
        receiverId,
        content,
      });

      // Send real-time notification
      await sendNotification(receiverId, {
        type: 'new_message',
        message,
      });

      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Notifications
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = req.params.id;
      await storage.markNotificationAsRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Wallet
  app.get('/api/wallet', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let wallet = await storage.getWallet(userId);
      
      if (!wallet) {
        wallet = await storage.createWallet(userId);
      }
      
      res.json(wallet);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const users = await storage.getUsers(limit, offset);
      const total = await storage.getUsersCount();

      res.json({ users, total, page, limit });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const userId = req.params.id;
      const updateData = req.body;

      const oldUser = await storage.getUser(userId);
      const user = await storage.updateUser(userId, updateData);

      // Log admin action
      await storage.createAuditLog({
        userId: req.user.claims.sub,
        action: 'ADMIN_USER_UPDATED',
        entityType: 'USER',
        entityId: userId,
        oldValues: oldUser,
        newValues: updateData,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.get('/api/admin/audit-logs', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = (page - 1) * limit;

      const logs = await storage.getAuditLogs(limit, offset);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  return httpServer;
}
>>>>>>> a757380dbfe2d95040e42f9db40e45de5910a0af
