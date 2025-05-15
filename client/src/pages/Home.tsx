import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePrivy } from "@privy-io/react-auth";

import ConfirmationModal from "@/components/ConfirmationModal";
import SuccessModal from "@/components/SuccessModal";
import { useTransactions } from "@/hooks/useTransactions";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Transaction } from "@shared/schema";
import React from "react";
import AccountHeader from "@/components/AccountHeader";
import PaymentForm from "@/components/PaymentForm";
import TransactionItem from "@/components/TransactionItem";

const recentContacts = [
  { id: 1, name: "Alex", initials: "AM", color: "bg-primary" },
  { id: 2, name: "Sarah", initials: "SJ", color: "bg-[#7C3AED]" },
  { id: 3, name: "David", initials: "DK", color: "bg-green-500" },
  { id: 4, name: "James", initials: "JL", color: "bg-amber-500" },
  { id: 5, name: "Rebecca", initials: "RB", color: "bg-rose-500" },
];

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: transactions = [] } = useTransactions();
  const { logout } = usePrivy();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [mode, setMode] = useState<"send" | "receive">("send");
  const { preferences } = useUserPreferences();
  const [transactionData, setTransactionData] = useState({
    amount: "",
    recipient: "",
    note: "",
    currency: preferences.sendCurrency || "USD",
  });
  const [transactionId, setTransactionId] = useState("");
  const [transactionTime, setTransactionTime] = useState("");
  
  // Current user info (would come from auth in a real app)
  const user = {
    balance: "$2,456.80",
    initials: "JD",
  };

  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: Transaction) => {
      const response = await apiRequest("POST", "/api/transactions", transaction);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setTransactionId(data.id);
      setTransactionTime(new Date().toLocaleString());
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to process payment: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleConfirmPayment = () => {
    if (!transactionData.amount || !transactionData.recipient) {
      toast({
        title: "Missing Information",
        description: "Please enter both amount and recipient information.",
        variant: "destructive",
      });
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleSendPayment = () => {
    const amount = parseFloat(transactionData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than zero.",
        variant: "destructive",
      });
      return;
    }

    createTransactionMutation.mutate({
      id: 0, // Will be assigned by the server
      type: mode,
      amount,
      recipient: transactionData.recipient,
      note: transactionData.note || null,
      timestamp: new Date(),
      status: "completed",
      currency: transactionData.currency || (mode === "send" ? preferences.sendCurrency : preferences.receiveCurrency) || "USD"
    });
  };

  const handleDone = () => {
    setIsSuccessModalOpen(false);
    setTransactionData({ 
      amount: "", 
      recipient: "", 
      note: "", 
      currency: preferences.sendCurrency || "USD" 
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <AccountHeader user={user} />
        <div className="mt-8">
          <PaymentForm 
            mode={mode}
            setMode={setMode}
            transactionData={transactionData}
            setTransactionData={(data) => setTransactionData({
              ...data,
              currency: data.currency || preferences.sendCurrency || "USD"
            })}
            onConfirm={handleConfirmPayment}
            isPending={createTransactionMutation.isPending}
          />
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </div>
        {/* Recent Contacts (Mobile only) */}
        {/*
        <div className="mt-8 md:hidden">
          <h3 className="text-lg font-semibold mb-4">Recent Contacts</h3>
          <div className="flex overflow-x-auto space-x-4 pb-4">
            {recentContacts.map((contact) => (
              <ContactItem 
                key={contact.id}
                name={contact.name}
                initials={contact.initials}
                color={contact.color}
              />
            ))}
          </div>
        </div>
        */}
      </div>
      {/* Modals */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        transactionData={transactionData}
        onConfirm={handleSendPayment}
        isPending={createTransactionMutation.isPending}
      />
      
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleDone}
        transactionId={transactionId}
        transactionTime={transactionTime}
      />
    </div>
  );
}