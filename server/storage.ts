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
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

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
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

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
  }
}

export const storage = new DatabaseStorage();
