import { WebSocket } from "ws";
import { storage } from "../storage";
import { type InsertNotification } from "@shared/schema";

export class NotificationService {
  private connectedClients = new Map<string, WebSocket>();

  setWebSocketClients(clients: Map<string, WebSocket>) {
    this.connectedClients = clients;
  }

  async sendNotification(userId: string, notification: Omit<InsertNotification, 'userId'>) {
    try {
      // Save notification to database
      const savedNotification = await storage.createNotification({
        ...notification,
        userId,
      });

      // Send via WebSocket if user is connected
      const userWs = this.connectedClients.get(userId);
      if (userWs && userWs.readyState === WebSocket.OPEN) {
        userWs.send(JSON.stringify({
          type: 'notification',
          data: savedNotification,
        }));
      }

      // Send push notification if user preferences allow
      await this.sendPushNotification(userId, notification);

      return savedNotification;
    } catch (error) {
      console.error('Notification error:', error);
      throw error;
    }
  }

  async sendBulkNotification(userIds: string[], notification: Omit<InsertNotification, 'userId'>) {
    const promises = userIds.map(userId => 
      this.sendNotification(userId, notification)
    );
    return Promise.all(promises);
  }

  private async sendPushNotification(userId: string, notification: any) {
    // Integrate with push notification service (FCM, OneSignal, etc.)
    // This is a placeholder implementation
    
    try {
      const user = await storage.getUser(userId);
      if (!user) return;

      // Mock push notification implementation
      console.log(`Push notification sent to ${user.email}:`, notification.title);
      
      // In a real implementation, you would:
      // 1. Get user's device tokens from database
      // 2. Send via FCM/APNS for mobile apps
      // 3. Send via Web Push API for browsers
      // 4. Handle different platforms (iOS, Android, Web, Windows)
      
    } catch (error) {
      console.error('Push notification error:', error);
    }
  }

  async sendEmailNotification(userId: string, subject: string, content: string) {
    // Integrate with email service (SendGrid, AWS SES, etc.)
    try {
      const user = await storage.getUser(userId);
      if (!user?.email) return;

      // Mock email implementation
      console.log(`Email sent to ${user.email}: ${subject}`);
      
      // In a real implementation:
      // const nodemailer = require('nodemailer');
      // Send actual email
      
    } catch (error) {
      console.error('Email notification error:', error);
    }
  }

  async sendSMSNotification(userId: string, message: string) {
    // Integrate with SMS service (Twilio, AWS SNS, etc.)
    try {
      const user = await storage.getUser(userId);
      if (!user?.phone) return;

      // Mock SMS implementation
      console.log(`SMS sent to ${user.phone}: ${message}`);
      
    } catch (error) {
      console.error('SMS notification error:', error);
    }
  }

  // Predefined notification templates
  async sendChargeCreatedNotification(debtorId: string, charge: any) {
    await this.sendNotification(debtorId, {
      type: 'charge_created',
      title: 'Nova cobrança recebida',
      content: `Você recebeu uma nova cobrança no valor de R$ ${charge.originalAmount}. Vencimento: ${new Date(charge.dueDate).toLocaleDateString('pt-BR')}`,
      data: { chargeId: charge.id },
    });
  }

  async sendPaymentReceivedNotification(creditorId: string, payment: any) {
    await this.sendNotification(creditorId, {
      type: 'payment_received',
      title: 'Pagamento recebido',
      content: `Pagamento de R$ ${payment.amount} foi confirmado via ${payment.method}`,
      data: { paymentId: payment.id },
    });
  }

  async sendChargeOverdueNotification(debtorId: string, charge: any) {
    await this.sendNotification(debtorId, {
      type: 'charge_overdue',
      title: 'Cobrança vencida',
      content: `Sua cobrança #${charge.chargeNumber} está vencida. Valor atual: R$ ${charge.currentAmount}`,
      data: { chargeId: charge.id },
    });

    // Also send email and SMS for overdue charges
    await this.sendEmailNotification(
      debtorId,
      'Cobrança Vencida - OursPaay',
      `Sua cobrança está vencida. Acesse a plataforma para regularizar.`
    );
  }

  async sendReferralBonusNotification(userId: string, amount: number, referredUserName: string) {
    await this.sendNotification(userId, {
      type: 'referral',
      title: 'Bônus de indicação recebido!',
      content: `Você ganhou R$ ${amount} pela indicação de ${referredUserName}`,
      data: { bonusAmount: amount },
    });
  }

  async sendSystemMaintenanceNotification(userIds: string[]) {
    await this.sendBulkNotification(userIds, {
      type: 'charge_created', // Using existing enum, would add 'system' type
      title: 'Manutenção programada',
      content: 'A plataforma entrará em manutenção às 02:00. Duração estimada: 1 hora.',
      data: { maintenanceWindow: '02:00-03:00' },
    });
  }

  // Notification preferences management
  async updateNotificationPreferences(userId: string, preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    webSocket: boolean;
    types: string[];
  }) {
    // Save preferences to user metadata
    const user = await storage.getUser(userId);
    if (!user) throw new Error('User not found');

    const metadata = user.metadata ? JSON.parse(user.metadata as string) : {};
    metadata.notificationPreferences = preferences;

    await storage.updateUser(userId, {
      metadata: JSON.stringify(metadata),
    });
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const notifications = await storage.getNotifications(userId);
    return notifications.filter(n => !n.isRead).length;
  }
}

export const notificationService = new NotificationService();
