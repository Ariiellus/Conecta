import { Home, ArrowRightLeft, History, Users, Settings, ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { Link, useLocation } from "wouter";
import TransactionItem from "./TransactionItem";
import { Transaction } from "@shared/schema";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  transactions: Transaction[];
}

export default function Sidebar({ transactions }: SidebarProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Payments", icon: <ArrowRightLeft className="h-6 w-6 min-w-6 flex-shrink-0" /> },
    { href: "/portfolio", label: "Portfolio", icon: <Wallet className="h-6 w-6 min-w-6 flex-shrink-0" /> },
    { href: "/history", label: "History", icon: <History className="h-6 w-6 min-w-6 flex-shrink-0" /> },
    { href: "/contacts", label: "Contacts", icon: <Users className="h-6 w-6 min-w-6 flex-shrink-0" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-6 w-6 min-w-6 flex-shrink-0" /> },
  ];

  const recentTransactions = transactions.slice(0, 3);

  return (
    <aside className={`bg-white shadow-lg flex-shrink-0 z-20 border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'md:w-70'}`}>
      {/* Logo and Brand */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          {!isCollapsed && <span className="ml-3 text-lg font-semibold">Conecta</span>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 h-10 w-10 rounded-full hover:bg-gray-100"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.label} className="mb-4">
              <Link href={item.href}>
                <div 
                  className={`flex items-center p-3 rounded-lg transition-colors group ${
                    location === item.href
                      ? "bg-primary-dark bg-opacity-10 text-primary" 
                      : "text-primary-dark hover:bg-gray-100"
                  } cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center justify-center">
                    {item.icon}
                  </div>
                  {!isCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Recent Transactions */}
      {!isCollapsed && (
        <div className="mt-6 p-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold uppercase text-gray-500 mb-4">Recent Transactions</h3>
          <ul>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <li className="text-sm text-gray-500 p-3">No recent transactions</li>
            )}

            <li className="mt-4">
              <Link href="/history">
                <div className="text-primary text-sm font-medium flex items-center cursor-pointer">
                  <span>View all transactions</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </aside>
  );
}