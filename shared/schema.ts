import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  decimal,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type").default("individual"), // individual, business
  cpfCnpj: varchar("cpf_cnpj"),
  phone: varchar("phone"),
  isActive: boolean("is_active").default(true),
  isBlocked: boolean("is_blocked").default(false),
  role: varchar("role").default("user"), // user, admin, moderator
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  termsAcceptanceIp: varchar("terms_acceptance_ip"),
  termsAcceptanceDevice: text("terms_acceptance_device"),
  termsVersion: varchar("terms_version"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Billing status enum
export const billingStatusEnum = pgEnum("billing_status", [
  "pending",
  "paid",
  "overdue",
  "cancelled",
  "partial"
]);

// Payment method enum
export const paymentMethodEnum = pgEnum("payment_method", [
  "pix",
  "boleto",
  "credit_card",
  "debit_card",
  "ted_doc",
  "crypto"
]);

// Billings table
export const billings = pgTable("billings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creditorId: varchar("creditor_id").notNull().references(() => users.id),
  debtorId: varchar("debtor_id").references(() => users.id),
  debtorName: varchar("debtor_name").notNull(),
  debtorEmail: varchar("debtor_email"),
  debtorPhone: varchar("debtor_phone"),
  debtorCpfCnpj: varchar("debtor_cpf_cnpj"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: billingStatusEnum("status").default("pending"),
  paymentMethod: paymentMethodEnum("payment_method"),
  allowInstallments: boolean("allow_installments").default(false),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  paidAt: timestamp("paid_at"),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  billingId: varchar("billing_id").notNull().references(() => billings.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: varchar("type").notNull(), // payment, refund, fee
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  status: varchar("status").notNull(), // pending, completed, failed
  externalTransactionId: varchar("external_transaction_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages table for chat
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  billingId: varchar("billing_id").notNull().references(() => billings.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // billing_created, payment_received, due_reminder, etc.
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  billingId: varchar("billing_id").references(() => billings.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wallet balance table
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0.00"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBillingSchema = createInsertSchema(billings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertBilling = z.infer<typeof insertBillingSchema>;
export type Billing = typeof billings.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
