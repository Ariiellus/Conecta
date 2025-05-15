import { users, type User, type InsertUser, transactions, type Transaction, type InsertTransaction, contacts, type Contact, type InsertContact } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(id: number, preferences: Partial<User>): Promise<User | undefined>;
  
  getAllTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined>;
  
  getContacts(userId: number): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private transactions: Map<number, Transaction> = new Map();
  private contacts: Map<number, Contact> = new Map();
  private userIdCounter: number = 1;
  private transactionIdCounter: number = 1;
  private contactIdCounter: number = 1;

  constructor() {
    // Add some initial data
    this.createUser({
      username: "johndoe",
      password: "password",
      email: "john@example.com",
      fullName: "John Doe"
    });
    
    // Add some sample transactions
    this.createTransaction({
      type: "send",
      amount: 120,
      recipient: "Sarah Johnson",
      note: "Rent payment",
      status: "completed"
    });
    
    this.createTransaction({
      type: "receive",
      amount: 245,
      recipient: "you@example.com",
      note: "Invoice #1234",
      status: "completed"
    });
    
    this.createTransaction({
      type: "send",
      amount: 35.99,
      recipient: "Netflix",
      note: "Monthly subscription",
      status: "completed"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    
    const user: User = { 
      id,
      ...insertUser,
      balance: 2500.00, // Start with some balance for demo
      sendCurrency: insertUser.sendCurrency || "USD",
      receiveCurrency: insertUser.receiveCurrency || "USD",
      twoFactorEnabled: false,
      stripeAccountId: null
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUserPreferences(id: number, preferences: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, ...preferences };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    
    const transaction: Transaction = {
      id,
      ...insertTransaction,
      timestamp: new Date().toISOString(),
      currency: insertTransaction.currency || "USD"
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      return undefined;
    }
    
    transaction.status = status;
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  async getContacts(userId: number): Promise<Contact[]> {
    return Array.from(this.contacts.values())
      .filter(contact => contact.userId === userId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }
  
  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.contactIdCounter++;
    
    const newContact: Contact = {
      id,
      ...contact,
      createdAt: new Date().toISOString()
    };
    
    this.contacts.set(id, newContact);
    return newContact;
  }
  
  async updateContact(id: number, contactData: Partial<Contact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) {
      return undefined;
    }
    
    const updatedContact = { ...contact, ...contactData };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }
  
  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }
}

export const storage = new MemStorage();