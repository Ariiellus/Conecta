"use client";

import { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import TransactionItem from "@/components/TransactionItem";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilterIcon, Search, ArrowDownUp } from "lucide-react";
import { Transaction } from "@shared/schema";

export default function History() {
  const { data: transactions = [] } = useTransactions();
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Filter transactions based on selected filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Filter by type
      if (filterType !== "all" && transaction.type !== filterType) {
        return false;
      }

      // Filter by search term (recipient or note)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const recipientMatch = transaction.recipient?.toLowerCase().includes(searchLower);
        const noteMatch = transaction.note?.toLowerCase().includes(searchLower);
        if (!recipientMatch && !noteMatch) {
          return false;
        }
      }

      // Filter by date range
      if (dateRange.from) {
        const transactionDate = new Date(transaction.timestamp);
        const fromDate = new Date(dateRange.from);
        if (transactionDate < fromDate) {
          return false;
        }
      }

      if (dateRange.to) {
        const transactionDate = new Date(transaction.timestamp);
        const toDate = new Date(dateRange.to);
        // Set time to end of day
        toDate.setHours(23, 59, 59, 999);
        if (transactionDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, filterType, searchTerm, dateRange]);

  const getTransactionSummary = () => {
    const inflows = filteredTransactions
      .filter(t => t.type === "receive")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const outflows = filteredTransactions
      .filter(t => t.type === "send")
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { inflows, outflows, total: inflows - outflows };
  };

  const summary = getTransactionSummary();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Transaction History</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <h3 className="text-sm text-gray-500 mb-2">Money In</h3>
          <p className="text-2xl font-semibold text-green-600">${summary.inflows.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <h3 className="text-sm text-gray-500 mb-2">Money Out</h3>
          <p className="text-2xl font-semibold text-red-600">${summary.outflows.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <h3 className="text-sm text-gray-500 mb-2">Net Flow</h3>
          <p className={`text-2xl font-semibold ${summary.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${summary.total.toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Filters</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setFilterType("all");
              setSearchTerm("");
              setDateRange({ from: "", to: "" });
            }}
          >
            Clear All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search Filter */}
          <div>
            <Label htmlFor="search" className="text-sm font-medium mb-2">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                id="search"
                type="text"
                placeholder="Search by recipient or note" 
                className="pl-10 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Date Range */}
          <div>
            <Label htmlFor="date-from" className="text-sm font-medium mb-2">Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input 
                id="date-from"
                type="date" 
                className="h-12"
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
              />
              <Input 
                id="date-to"
                type="date" 
                className="h-12"
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
              />
            </div>
          </div>
          
          {/* Type Filter */}
          <div>
            <Label className="text-sm font-medium mb-2">Transaction Type</Label>
            <div className="flex space-x-2">
              <Button 
                variant={filterType === "all" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setFilterType("all")}
              >
                All
              </Button>
              <Button 
                variant={filterType === "receive" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setFilterType("receive")}
              >
                In
              </Button>
              <Button 
                variant={filterType === "send" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setFilterType("send")}
              >
                Out
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transactions List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Transactions</h2>
        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
            <ArrowDownUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or make a transaction.</p>
            <Button onClick={() => {
              setFilterType("all");
              setSearchTerm("");
              setDateRange({ from: "", to: "" });
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}