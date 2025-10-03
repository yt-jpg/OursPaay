import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
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
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      if (userId && userId !== '') {
        connections.delete(userId);
      }
    });
  });

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
