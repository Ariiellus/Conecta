import { Home, ArrowRightLeft, History, Users, Settings, ChevronLeft, ChevronRight, LogOut, Wallet } from "lucide-react";
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
    { href: "/", label: "Dashboard", icon: <Home className="text-lg" /> },
    { href: "/payments", label: "Payments", icon: <ArrowRightLeft className="text-lg" /> },
    { href: "/portfolio", label: "Portfolio", icon: <Wallet className="text-lg" /> },
    { href: "/history", label: "History", icon: <History className="text-lg" /> },
    { href: "/contacts", label: "Contacts", icon: <Users className="text-lg" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="text-lg" /> },
  ];

  const recentTransactions = transactions.slice(0, 3);

  return (
    <aside className={`bg-white shadow-lg flex-shrink-0 z-20 border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'md:w-72'}`}>
      {/* Logo and Brand */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
            <ArrowRightLeft className="text-lg" />
          </div>
          {!isCollapsed && <span className="ml-3 text-lg font-semibold">Conecta</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-2"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.label} className="mb-2">
              <Link href={item.href}>
                <a 
                  className={`flex items-center p-3 rounded-lg transition-colors group ${
                    (item.href === "/" && location === "/") || 
                    (item.href !== "/" && location.startsWith(item.href))
                      ? "bg-primary-dark bg-opacity-10 text-primary" 
                      : "text-primary-dark hover:bg-gray-100"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                </a>
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
                <a className="text-primary text-sm font-medium flex items-center">
                  <span>View all transactions</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </aside>
  );
}