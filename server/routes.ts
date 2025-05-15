import express, { Router, type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertContactSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = Router();
  
  // Get all transactions
  apiRouter.get("/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Create a new transaction
  apiRouter.post("/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const newTransaction = await storage.createTransaction(validatedData);
      
      // In a real app, we would update user balances here
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

  // Get a specific transaction by ID
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

  // Contacts Endpoints
  apiRouter.get("/contacts", async (req, res) => {
    try {
      // In a real app, we would get the userId from the authenticated session
      const userId = 1; // Mock user ID for demo
      const contacts = await storage.getContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  apiRouter.post("/contacts", async (req, res) => {
    try {
      // In a real app, we would get the userId from the authenticated session
      const userId = 1; // Mock user ID for demo
      
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
      
      // In a real app, we would verify the contact belongs to the authenticated user
      
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
      
      // In a real app, we would verify the contact belongs to the authenticated user
      
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

  // User Preferences Endpoints
  apiRouter.get("/user/preferences", async (req, res) => {
    try {
      // In a real app, we would get the userId from the authenticated session
      const userId = 1; // Mock user ID for demo
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Return only the preferences, not the full user object with password etc.
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
      // In a real app, we would get the userId from the authenticated session
      const userId = 1; // Mock user ID for demo
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Validate preferences
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
      
      // Return only the preferences, not the full user object
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

  // Currency conversion endpoint (mock)
  apiRouter.get("/currency/convert", async (req, res) => {
    try {
      const { from, to, amount } = req.query;
      
      if (!from || !to || !amount) {
        return res.status(400).json({ error: "Missing required parameters: from, to, amount" });
      }
      
      const numAmount = parseFloat(amount as string);
      if (isNaN(numAmount)) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      
      // Mock conversion rates (in a real app, these would come from an external API)
      const rates = {
        USD: 1,
        MXN: 17.5,
        BRZ: 5.2,
        AUDD: 1.5,
        USDC: 1,
        EURC: 0.92
      };
      
      const fromCurrency = (from as string).toUpperCase();
      const toCurrency = (to as string).toUpperCase();
      
      if (!rates[fromCurrency] || !rates[toCurrency]) {
        return res.status(400).json({ error: "Unsupported currency" });
      }
      
      // Convert to USD first, then to target currency
      const inUSD = numAmount / rates[fromCurrency];
      const converted = inUSD * rates[toCurrency];
      
      res.json({
        from: fromCurrency,
        to: toCurrency,
        amount: numAmount,
        result: converted,
        rate: rates[toCurrency] / rates[fromCurrency]
      });
    } catch (error) {
      console.error("Error converting currency:", error);
      res.status(500).json({ error: "Failed to convert currency" });
    }
  });

  // Mount the API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
