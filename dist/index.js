// server/index.ts
import express3 from "express";

// server/routes.ts
import { Router } from "express";
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users = /* @__PURE__ */ new Map();
  transactions = /* @__PURE__ */ new Map();
  contacts = /* @__PURE__ */ new Map();
  userIdCounter = 1;
  transactionIdCounter = 1;
  contactIdCounter = 1;
  constructor() {
    this.createUser({
      username: "johndoe",
      password: "password",
      email: "john@example.com",
      fullName: "John Doe"
    });
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
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return void 0;
  }
  async createUser(insertUser) {
    const id = this.userIdCounter++;
    const user = {
      id,
      ...insertUser,
      balance: 2500,
      // Start with some balance for demo
      sendCurrency: insertUser.sendCurrency || "USD",
      receiveCurrency: insertUser.receiveCurrency || "USD",
      twoFactorEnabled: false,
      stripeAccountId: null
    };
    this.users.set(id, user);
    return user;
  }
  async updateUserPreferences(id, preferences) {
    const user = this.users.get(id);
    if (!user) {
      return void 0;
    }
    const updatedUser = { ...user, ...preferences };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async getAllTransactions() {
    return Array.from(this.transactions.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  async getTransaction(id) {
    return this.transactions.get(id);
  }
  async createTransaction(insertTransaction) {
    const id = this.transactionIdCounter++;
    const transaction = {
      id,
      ...insertTransaction,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      currency: insertTransaction.currency || "USD"
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
  async updateTransactionStatus(id, status) {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      return void 0;
    }
    transaction.status = status;
    this.transactions.set(id, transaction);
    return transaction;
  }
  async getContacts(userId) {
    return Array.from(this.contacts.values()).filter((contact) => contact.userId === userId).sort((a, b) => a.name.localeCompare(b.name));
  }
  async getContact(id) {
    return this.contacts.get(id);
  }
  async createContact(contact) {
    const id = this.contactIdCounter++;
    const newContact = {
      id,
      ...contact,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.contacts.set(id, newContact);
    return newContact;
  }
  async updateContact(id, contactData) {
    const contact = this.contacts.get(id);
    if (!contact) {
      return void 0;
    }
    const updatedContact = { ...contact, ...contactData };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }
  async deleteContact(id) {
    return this.contacts.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  balance: doublePrecision("balance").notNull().default(0),
  sendCurrency: text("send_currency").default("USD"),
  receiveCurrency: text("receive_currency").default("USD"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  stripeAccountId: text("stripe_account_id")
});
var transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  // "send" or "receive"
  amount: doublePrecision("amount").notNull(),
  recipient: text("recipient").notNull(),
  note: text("note"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: text("status").notNull().default("pending"),
  // pending, completed, failed
  currency: text("currency").default("USD")
});
var contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  address: text("address"),
  phone: text("phone"),
  notes: text("notes"),
  favorite: boolean("favorite").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  sendCurrency: true,
  receiveCurrency: true
});
var insertTransactionSchema = createInsertSchema(transactions).pick({
  type: true,
  amount: true,
  recipient: true,
  note: true,
  status: true,
  currency: true
});
var insertContactSchema = createInsertSchema(contacts).pick({
  userId: true,
  name: true,
  email: true,
  address: true,
  phone: true,
  notes: true,
  favorite: true
});

// server/routes.ts
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
async function registerRoutes(app2) {
  const apiRouter = Router();
  apiRouter.get("/transactions", async (req, res) => {
    try {
      const transactions2 = await storage.getAllTransactions();
      res.json(transactions2);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });
  apiRouter.post("/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const newTransaction = await storage.createTransaction(validatedData);
      res.status(201).json(newTransaction);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        console.error("Error creating transaction:", error);
        res.status(500).json({ error: "Failed to create transaction" });
      }
    }
  });
  apiRouter.get("/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid transaction ID" });
      }
      const transaction = await storage.getTransaction(id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  });
  apiRouter.get("/contacts", async (req, res) => {
    try {
      const userId = 1;
      const contacts2 = await storage.getContacts(userId);
      res.json(contacts2);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });
  apiRouter.post("/contacts", async (req, res) => {
    try {
      const userId = 1;
      const validatedData = insertContactSchema.parse({
        ...req.body,
        userId
      });
      const newContact = await storage.createContact(validatedData);
      res.status(201).json(newContact);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        console.error("Error creating contact:", error);
        res.status(500).json({ error: "Failed to create contact" });
      }
    }
  });
  apiRouter.put("/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      const updatedContact = await storage.updateContact(id, req.body);
      res.json(updatedContact);
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({ error: "Failed to update contact" });
    }
  });
  apiRouter.delete("/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      await storage.deleteContact(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contact:", error);
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });
  apiRouter.get("/user/preferences", async (req, res) => {
    try {
      const userId = 1;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        sendCurrency: user.sendCurrency,
        receiveCurrency: user.receiveCurrency,
        twoFactorEnabled: user.twoFactorEnabled,
        stripeAccountId: user.stripeAccountId
      });
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ error: "Failed to fetch user preferences" });
    }
  });
  apiRouter.put("/user/preferences", async (req, res) => {
    try {
      const userId = 1;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const preferencesSchema = z.object({
        sendCurrency: z.string().optional(),
        receiveCurrency: z.string().optional(),
        twoFactorEnabled: z.boolean().optional(),
        stripeAccountId: z.string().nullable().optional()
      });
      const validatedData = preferencesSchema.parse(req.body);
      const updatedUser = await storage.updateUserPreferences(userId, validatedData);
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user preferences" });
      }
      res.json({
        sendCurrency: updatedUser.sendCurrency,
        receiveCurrency: updatedUser.receiveCurrency,
        twoFactorEnabled: updatedUser.twoFactorEnabled,
        stripeAccountId: updatedUser.stripeAccountId
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        console.error("Error updating user preferences:", error);
        res.status(500).json({ error: "Failed to update user preferences" });
      }
    }
  });
  apiRouter.get("/currency/convert", async (req, res) => {
    try {
      const { from, to, amount, networkId = "8453" } = req.query;
      if (!from || !to || !amount) {
        return res.status(400).json({ error: "Missing required parameters: from, to, amount" });
      }
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      const networkRates = {
        "8453": {
          // Base Network
          USD: 1,
          MXN: 17.5,
          BRZ: 5.2,
          USDC: 1,
          EURC: 0.92
        },
        "5000": {
          // Mantle Network
          USD: 1,
          BRZ: 5.2,
          USDC: 1
        }
      };
      const fromCurrency = from.toUpperCase();
      const toCurrency = to.toUpperCase();
      const network = networkId;
      if (!networkRates[network]) {
        return res.status(400).json({ error: "Unsupported network" });
      }
      if (!networkRates[network][fromCurrency] || !networkRates[network][toCurrency]) {
        return res.status(400).json({ error: "Unsupported currency pair for the selected network" });
      }
      const inUSD = numAmount / networkRates[network][fromCurrency];
      const converted = inUSD * networkRates[network][toCurrency];
      res.json({
        from: fromCurrency,
        to: toCurrency,
        amount: numAmount,
        result: converted,
        rate: networkRates[network][toCurrency] / networkRates[network][fromCurrency],
        networkId: network
      });
    } catch (error) {
      console.error("Error converting currency:", error);
      res.status(500).json({ error: "Failed to convert currency" });
    }
  });
  app2.use("/api", apiRouter);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: ["localhost", "127.0.0.1"]
  };
  const vite = await createViteServer({
    configFile: path.resolve(process.cwd(), "vite.config.ts"),
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        process.cwd(),
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path.resolve(process.cwd(), "dist/public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const findAvailablePort = (startPort) => {
    return new Promise((resolve) => {
      const tryPort = (port2) => {
        server.listen(port2, "0.0.0.0").once("listening", () => {
          server.close(() => resolve(port2));
        }).once("error", () => {
          tryPort(port2 + 1);
        });
      };
      tryPort(startPort);
    });
  };
  const port = await findAvailablePort(3e3);
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
