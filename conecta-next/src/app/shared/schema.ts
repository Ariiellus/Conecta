import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  balance: doublePrecision("balance").notNull().default(0),
  sendCurrency: text("send_currency").default("USD"),
  receiveCurrency: text("receive_currency").default("USD"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  stripeAccountId: text("stripe_account_id"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "send" or "receive"
  amount: doublePrecision("amount").notNull(),
  recipient: text("recipient").notNull(),
  note: text("note"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  currency: text("currency").default("USD"),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  address: text("address"),
  phone: text("phone"),
  notes: text("notes"),
  favorite: boolean("favorite").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  sendCurrency: true,
  receiveCurrency: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  type: true,
  amount: true,
  recipient: true,
  note: true,
  status: true,
  currency: true,
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  userId: true,
  name: true,
  email: true,
  address: true,
  phone: true,
  notes: true,
  favorite: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
