<<<<<<< HEAD
import { 
  users, sessions, charges, payments, wallets, walletTransactions, 
  referrals, chatConversations, chatMessages, notifications, auditLogs, contractAcceptances,
  type User, type InsertUser, type Charge, type InsertCharge, 
  type Payment, type InsertPayment, type ChatMessage, type InsertChatMessage,
  type Notification, type InsertNotification, type Referral, type Wallet, type WalletTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, gte, lte, sum, count } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Session management
  createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<string>;
  validateSession(sessionId: string): Promise<User | null>;
  deleteSession(sessionId: string): Promise<void>;
  
  // Contract acceptances
  recordContractAcceptance(data: {
    userId: string;
    contractType: string;
    contractVersion: string;
    ipAddress: string;
    userAgent: string;
    deviceFingerprint: string;
    cryptoHash: string;
  }): Promise<void>;
  
  // Charges
  createCharge(charge: InsertCharge): Promise<Charge>;
  getCharges(userId: string, filters?: any): Promise<Charge[]>;
  getChargeById(id: string): Promise<Charge | undefined>;
  updateCharge(id: string, updates: Partial<Charge>): Promise<Charge>;
  
  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayments(userId: string): Promise<Payment[]>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment>;
  
  // Wallet
  getWallet(userId: string): Promise<Wallet>;
  createWalletTransaction(transaction: Omit<WalletTransaction, 'id' | 'createdAt'>): Promise<WalletTransaction>;
  getWalletTransactions(walletId: string): Promise<WalletTransaction[]>;
  updateWalletBalance(userId: string, amount: number, type: string): Promise<Wallet>;
  
  // Referrals
  createReferral(referrerId: string, referredId: string, rewardAmount: number): Promise<Referral>;
  getReferrals(userId: string): Promise<Referral[]>;
  updateReferral(id: string, updates: Partial<Referral>): Promise<Referral>;
  
  // Chat
  createConversation(participantIds: string[], type: string): Promise<string>;
  getConversations(userId: string): Promise<any[]>;
  createMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getMessages(conversationId: string): Promise<ChatMessage[]>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  
  // Audit
  createAuditLog(data: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void>;
  
  // Dashboard stats
  getDashboardStats(userId: string): Promise<{
    totalRevenue: number;
    activeCharges: number;
    conversionRate: number;
    walletBalance: number;
    monthlyRevenue: number[];
    paymentMethods: any[];
    recentTransactions: any[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
=======
import {
  users,
  billings,
  transactions,
  messages,
  notifications,
  auditLogs,
  wallets,
  type User,
  type UpsertUser,
  type InsertBilling,
  type Billing,
  type InsertTransaction,
  type Transaction,
  type InsertMessage,
  type Message,
  type InsertNotification,
  type Notification,
  type InsertAuditLog,
  type AuditLog,
  type Wallet,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getUsers(limit?: number, offset?: number): Promise<User[]>;
  getUsersCount(): Promise<number>;
  
  // Billing operations
  createBilling(billing: InsertBilling): Promise<Billing>;
  getBilling(id: string): Promise<Billing | undefined>;
  getBillingsByCreditor(creditorId: string): Promise<Billing[]>;
  getBillingsByDebtor(debtorId: string): Promise<Billing[]>;
  updateBilling(id: string, data: Partial<Billing>): Promise<Billing>;
  deleteBilling(id: string): Promise<void>;
  getBillingsStats(userId: string): Promise<any>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  getTransactionsByBilling(billingId: string): Promise<Transaction[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByBilling(billingId: string): Promise<Message[]>;
  markMessageAsRead(messageId: string): Promise<void>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  getUnreadNotificationsCount(userId: string): Promise<number>;
  
  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number, offset?: number): Promise<AuditLog[]>;
  
  // Wallet operations
  getWallet(userId: string): Promise<Wallet | undefined>;
  updateWalletBalance(userId: string, amount: string): Promise<Wallet>;
  createWallet(userId: string): Promise<Wallet>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
>>>>>>> a757380dbfe2d95040e42f9db40e45de5910a0af
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
<<<<<<< HEAD
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const referralCode = this.generateReferralCode();
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, referralCode })
      .returning();
    
    // Create wallet for new user
    await db.insert(wallets).values({
      userId: user.id,
      balance: '0',
      cashbackBalance: '0',
      referralBonus: '0',
      totalEarned: '0',
      totalWithdrawn: '0',
    });
    
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
=======
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
>>>>>>> a757380dbfe2d95040e42f9db40e45de5910a0af
      .where(eq(users.id, id))
      .returning();
    return user;
  }

<<<<<<< HEAD
  async createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<string> {
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await db.insert(sessions).values({
      id: sessionId,
      userId,
      expiresAt,
      ipAddress,
      userAgent,
    });
    
    return sessionId;
  }

  async validateSession(sessionId: string): Promise<User | null> {
    const result = await db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(
        eq(sessions.id, sessionId),
        eq(sessions.isActive, true),
        gte(sessions.expiresAt, new Date())
      ));
    
    return result[0]?.user || null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ isActive: false })
      .where(eq(sessions.id, sessionId));
  }

  async recordContractAcceptance(data: {
    userId: string;
    contractType: string;
    contractVersion: string;
    ipAddress: string;
    userAgent: string;
    deviceFingerprint: string;
    cryptoHash: string;
  }): Promise<void> {
    await db.insert(contractAcceptances).values(data);
  }

  async createCharge(charge: InsertCharge): Promise<Charge> {
    const chargeNumber = this.generateChargeNumber();
    const [newCharge] = await db
      .insert(charges)
      .values({ ...charge, chargeNumber, currentAmount: charge.originalAmount })
      .returning();
    return newCharge;
  }

  async getCharges(userId: string, filters?: any): Promise<Charge[]> {
    return await db
      .select()
      .from(charges)
      .where(or(eq(charges.creditorId, userId), eq(charges.debtorId, userId)))
      .orderBy(desc(charges.createdAt));
  }

  async getChargeById(id: string): Promise<Charge | undefined> {
    const [charge] = await db.select().from(charges).where(eq(charges.id, id));
    return charge || undefined;
  }

  async updateCharge(id: string, updates: Partial<Charge>): Promise<Charge> {
    const [charge] = await db
      .update(charges)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(charges.id, id))
      .returning();
    return charge;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async getPayments(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.payerId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async getWallet(userId: string): Promise<Wallet> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    
    if (!wallet) {
      // Create wallet if it doesn't exist
      const [newWallet] = await db.insert(wallets).values({
        userId,
        balance: '0',
        cashbackBalance: '0',
        referralBonus: '0',
        totalEarned: '0',
        totalWithdrawn: '0',
      }).returning();
      return newWallet;
    }
    
    return wallet;
  }

  async createWalletTransaction(transaction: Omit<WalletTransaction, 'id' | 'createdAt'>): Promise<WalletTransaction> {
    const [newTransaction] = await db.insert(walletTransactions).values(transaction).returning();
    return newTransaction;
  }

  async getWalletTransactions(walletId: string): Promise<WalletTransaction[]> {
    return await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, walletId))
      .orderBy(desc(walletTransactions.createdAt));
  }

  async updateWalletBalance(userId: string, amount: number, type: string): Promise<Wallet> {
    const wallet = await this.getWallet(userId);
    const newBalance = parseFloat(wallet.balance) + amount;
    
    const [updatedWallet] = await db
      .update(wallets)
      .set({ 
        balance: newBalance.toString(),
        updatedAt: new Date()
      })
      .where(eq(wallets.userId, userId))
      .returning();
    
    // Create transaction record
    await this.createWalletTransaction({
      walletId: wallet.id,
      type,
      amount: amount.toString(),
      description: `${type} transaction`,
      balanceBefore: wallet.balance,
      balanceAfter: newBalance.toString(),
    });
    
    return updatedWallet;
  }

  async createReferral(referrerId: string, referredId: string, rewardAmount: number): Promise<Referral> {
    const [referral] = await db.insert(referrals).values({
      referrerId,
      referredId,
      rewardAmount: rewardAmount.toString(),
      status: 'pending',
    }).returning();
    return referral;
  }

  async getReferrals(userId: string): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));
  }

  async updateReferral(id: string, updates: Partial<Referral>): Promise<Referral> {
    const [referral] = await db
      .update(referrals)
      .set(updates)
      .where(eq(referrals.id, id))
      .returning();
    return referral;
  }

  async createConversation(participantIds: string[], type: string): Promise<string> {
    const [conversation] = await db.insert(chatConversations).values({
      participantIds: JSON.stringify(participantIds),
      type,
    }).returning();
    return conversation.id;
  }

  async getConversations(userId: string): Promise<any[]> {
    const conversations = await db
      .select()
      .from(chatConversations)
      .orderBy(desc(chatConversations.updatedAt));
    
    return conversations.filter(conv => {
      const participants = JSON.parse(conv.participantIds as string);
      return participants.includes(userId);
    });
  }

  async createMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    
    // Update conversation timestamp
    await db
      .update(chatConversations)
      .set({ updatedAt: new Date() })
      .where(eq(chatConversations.id, message.conversationId));
    
    return newMessage;
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.createdAt);
  }

=======
  async getUsers(limit = 50, offset = 0): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));
  }

  async getUsersCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(users);
    return result.count;
  }

  // Billing operations
  async createBilling(billing: InsertBilling): Promise<Billing> {
    const [newBilling] = await db.insert(billings).values(billing).returning();
    return newBilling;
  }

  async getBilling(id: string): Promise<Billing | undefined> {
    const [billing] = await db.select().from(billings).where(eq(billings.id, id));
    return billing;
  }

  async getBillingsByCreditor(creditorId: string): Promise<Billing[]> {
    return await db
      .select()
      .from(billings)
      .where(eq(billings.creditorId, creditorId))
      .orderBy(desc(billings.createdAt));
  }

  async getBillingsByDebtor(debtorId: string): Promise<Billing[]> {
    return await db
      .select()
      .from(billings)
      .where(eq(billings.debtorId, debtorId))
      .orderBy(desc(billings.createdAt));
  }

  async updateBilling(id: string, data: Partial<Billing>): Promise<Billing> {
    const [billing] = await db
      .update(billings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(billings.id, id))
      .returning();
    return billing;
  }

  async deleteBilling(id: string): Promise<void> {
    await db.delete(billings).where(eq(billings.id, id));
  }

  async getBillingsStats(userId: string): Promise<any> {
    const [totalReceivable] = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(billings)
      .where(and(eq(billings.creditorId, userId), eq(billings.status, "pending")));

    const [paidAmount] = await db
      .select({ total: sql<number>`COALESCE(SUM(paid_amount), 0)` })
      .from(billings)
      .where(and(eq(billings.creditorId, userId), eq(billings.status, "paid")));

    const [pendingAmount] = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(billings)
      .where(and(eq(billings.creditorId, userId), eq(billings.status, "pending")));

    const [overdueAmount] = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(billings)
      .where(and(eq(billings.creditorId, userId), eq(billings.status, "overdue")));

    const [pendingCount] = await db
      .select({ count: count() })
      .from(billings)
      .where(and(eq(billings.creditorId, userId), eq(billings.status, "pending")));

    const [overdueCount] = await db
      .select({ count: count() })
      .from(billings)
      .where(and(eq(billings.creditorId, userId), eq(billings.status, "overdue")));

    return {
      totalReceivable: totalReceivable.total,
      paidAmount: paidAmount.total,
      pendingAmount: pendingAmount.total,
      overdueAmount: overdueAmount.total,
      pendingCount: pendingCount.count,
      overdueCount: overdueCount.count,
    };
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByBilling(billingId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.billingId, billingId))
      .orderBy(desc(transactions.createdAt));
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessagesByBilling(billingId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.billingId, billingId))
      .orderBy(messages.createdAt);
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  // Notification operations
>>>>>>> a757380dbfe2d95040e42f9db40e45de5910a0af
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

<<<<<<< HEAD
  async getNotifications(userId: string): Promise<Notification[]> {
=======
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
>>>>>>> a757380dbfe2d95040e42f9db40e45de5910a0af
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

<<<<<<< HEAD
  async markNotificationRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, id));
  }

  async createAuditLog(data: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await db.insert(auditLogs).values(data);
  }

  async getDashboardStats(userId: string): Promise<{
    totalRevenue: number;
    activeCharges: number;
    conversionRate: number;
    walletBalance: number;
    monthlyRevenue: number[];
    paymentMethods: any[];
    recentTransactions: any[];
  }> {
    const wallet = await this.getWallet(userId);
    
    // Get basic stats
    const [revenueData] = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .innerJoin(charges, eq(payments.chargeId, charges.id))
      .where(and(
        eq(charges.creditorId, userId),
        eq(payments.status, 'completed')
      ));

    const [chargesData] = await db
      .select({ count: count() })
      .from(charges)
      .where(and(
        eq(charges.creditorId, userId),
        eq(charges.status, 'pending')
      ));

    // Get recent transactions
    const recentTransactions = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        method: payments.method,
        status: payments.status,
        createdAt: payments.createdAt,
        chargeDescription: charges.description,
      })
      .from(payments)
      .innerJoin(charges, eq(payments.chargeId, charges.id))
      .where(eq(charges.creditorId, userId))
      .orderBy(desc(payments.createdAt))
      .limit(10);

    return {
      totalRevenue: parseFloat(revenueData?.total || '0'),
      activeCharges: chargesData?.count || 0,
      conversionRate: 87.3, // This would be calculated based on actual data
      walletBalance: parseFloat(wallet.balance),
      monthlyRevenue: [24000, 30000, 34000, 40000, 28000, 32000], // Mock data for chart
      paymentMethods: [
        { name: 'PIX', count: 1847, amount: 487230, percentage: 57.5 },
        { name: 'Cartão', count: 892, amount: 258430.50, percentage: 30.5 },
        { name: 'Boleto', count: 324, amount: 101732, percentage: 12.0 },
      ],
      recentTransactions,
    };
  }

  private generateChargeNumber(): string {
    return `CHG-${Date.now().toString().slice(-6)}`;
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
=======
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.count;
  }

  // Audit log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await db.insert(auditLogs).values(log).returning();
    return auditLog;
  }

  async getAuditLogs(limit = 100, offset = 0): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(auditLogs.createdAt));
  }

  // Wallet operations
  async getWallet(userId: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }

  async updateWalletBalance(userId: string, amount: string): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set({ balance: amount, updatedAt: new Date() })
      .where(eq(wallets.userId, userId))
      .returning();
    return wallet;
  }

  async createWallet(userId: string): Promise<Wallet> {
    const [wallet] = await db
      .insert(wallets)
      .values({ userId, balance: "0.00" })
      .returning();
    return wallet;
>>>>>>> a757380dbfe2d95040e42f9db40e45de5910a0af
  }
}

export const storage = new DatabaseStorage();
