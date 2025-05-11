import { users, type User, type InsertUser, transactions, type Transaction, type InsertTransaction } from "../shared/schema";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private userIdCounter: number;
  private transactionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    
    // Add some initial data
    this.createUser({
      username: "johndoe",
      password: "password123",
      email: "john@example.com",
      fullName: "John Doe",
    }).then(user => {
      // Add some sample transactions
      this.createTransaction({
        type: "receive",
        amount: 245,
        recipient: "Alex",
        note: "For dinner",
        status: "completed",
      });
      
      this.createTransaction({
        type: "send",
        amount: 120,
        recipient: "Sarah",
        note: "Birthday gift",
        status: "completed",
      });
      
      this.createTransaction({
        type: "receive",
        amount: 75.5,
        recipient: "David",
        note: "Splitting the bill",
        status: "completed",
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      balance: 2456.80 // Starting balance for demo purposes
    };
    this.users.set(id, user);
    return user;
  }

  // Transaction methods
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const timestamp = new Date().toISOString();
    
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      timestamp
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { ...transaction, status };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
}

export const storage = new MemStorage();
