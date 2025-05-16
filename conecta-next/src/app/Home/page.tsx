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
import { NebulaButton } from "@/components/NebulaButton";

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
  const { user, logout } = usePrivy();
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

  // Use actual user data from Privy
  const userInfo = {
    balance: "$2,456.80", // This should come from your actual balance tracking
    initials: user?.wallet?.address?.slice(2, 4).toUpperCase() || "??",
    address: user?.wallet?.address
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
    <div className="flex flex-col min-h-screen bg-gray-50 relative">
      <div className="container mx-auto px-4 py-8">
        <AccountHeader user={userInfo} />
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
      </div>

      {/* Fixed position Nebula Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <NebulaButton />
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