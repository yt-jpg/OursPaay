import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'moderator', 'collector_pf', 'collector_pj', 'debtor', 'support']);
export const chargeStatusEnum = pgEnum('charge_status', ['pending', 'paid', 'overdue', 'cancelled', 'negotiating']);
export const paymentMethodEnum = pgEnum('payment_method', ['pix', 'credit_card', 'boleto', 'ted_doc', 'crypto']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'cancelled']);
export const notificationTypeEnum = pgEnum('notification_type', ['charge_created', 'payment_received', 'charge_overdue', 'message', 'contract', 'referral']);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: userRoleEnum("role").notNull().default('debtor'),
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: boolean("email_verified").notNull().default(false),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorSecret: text("two_factor_secret"),
  backupCodes: jsonb("backup_codes"),
  language: varchar("language", { length: 5 }).notNull().default('pt-BR'),
  avatar: text("avatar"),
  referralCode: varchar("referral_code", { length: 20 }).unique(),
  referredBy: uuid("referred_by").references(() => users.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Sessions table
export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  deviceFingerprint: text("device_fingerprint"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Contract acceptances
export const contractAcceptances = pgTable("contract_acceptances", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  contractType: varchar("contract_type", { length: 50 }).notNull(),
  contractVersion: varchar("contract_version", { length: 20 }).notNull(),
  acceptedAt: timestamp("accepted_at").notNull().default(sql`now()`),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  userAgent: text("user_agent").notNull(),
  deviceFingerprint: text("device_fingerprint").notNull(),
  cryptoHash: text("crypto_hash").notNull(),
  metadata: jsonb("metadata"),
});

// Charges table
export const charges = pgTable("charges", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  chargeNumber: varchar("charge_number", { length: 20 }).notNull().unique(),
  creditorId: uuid("creditor_id").notNull().references(() => users.id),
  debtorId: uuid("debtor_id").notNull().references(() => users.id),
  description: text("description").notNull(),
  originalAmount: decimal("original_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).default('0'),
  fineRate: decimal("fine_rate", { precision: 5, scale: 2 }).default('0'),
  dueDate: timestamp("due_date").notNull(),
  status: chargeStatusEnum("status").notNull().default('pending'),
  isRecurrent: boolean("is_recurrent").notNull().default(false),
  recurrenceRule: jsonb("recurrence_rule"),
  installments: integer("installments").default(1),
  currentInstallment: integer("current_installment").default(1),
  parentChargeId: uuid("parent_charge_id").references(() => charges.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Payments table
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  chargeId: uuid("charge_id").notNull().references(() => charges.id, { onDelete: 'cascade' }),
  payerId: uuid("payer_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: transactionStatusEnum("status").notNull().default('pending'),
  externalId: varchar("external_id", { length: 255 }),
  processorData: jsonb("processor_data"),
  receiptUrl: text("receipt_url"),
  confirmationCode: varchar("confirmation_code", { length: 50 }),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Wallet table
export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default('0'),
  cashbackBalance: decimal("cashback_balance", { precision: 12, scale: 2 }).notNull().default('0'),
  referralBonus: decimal("referral_bonus", { precision: 12, scale: 2 }).notNull().default('0'),
  totalEarned: decimal("total_earned", { precision: 12, scale: 2 }).notNull().default('0'),
  totalWithdrawn: decimal("total_withdrawn", { precision: 12, scale: 2 }).notNull().default('0'),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Wallet transactions
export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: uuid("wallet_id").notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  type: varchar("type", { length: 20 }).notNull(), // credit, debit, cashback, referral, withdrawal
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  referenceType: varchar("reference_type", { length: 20 }),
  referenceId: uuid("reference_id"),
  balanceBefore: decimal("balance_before", { precision: 12, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Referrals table
export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: uuid("referrer_id").notNull().references(() => users.id),
  referredId: uuid("referred_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, active, blocked
  rewardAmount: decimal("reward_amount", { precision: 12, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  paidAt: timestamp("paid_at"),
  validationData: jsonb("validation_data"), // IP, device, KYC status
  fraudScore: integer("fraud_score").default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Chat conversations
export const chatConversations = pgTable("chat_conversations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  participantIds: jsonb("participant_ids").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // user_user, user_ai, user_support
  status: varchar("status", { length: 20 }).notNull().default('active'),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: uuid("conversation_id").notNull().references(() => chatConversations.id, { onDelete: 'cascade' }),
  senderId: uuid("sender_id").references(() => users.id),
  senderType: varchar("sender_type", { length: 20 }).notNull(), // user, ai, system
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 20 }).notNull().default('text'), // text, file, image
  attachments: jsonb("attachments"),
  aiContext: jsonb("ai_context"),
  readBy: jsonb("read_by"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  data: jsonb("data"),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  resourceId: uuid("resource_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChargeSchema = createInsertSchema(charges).omit({
  id: true,
  chargeNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Charge = typeof charges.$inferSelect;
export type InsertCharge = z.infer<typeof insertChargeSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
