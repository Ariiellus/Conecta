
import { Bell, CreditCard, User, LogOut } from "lucide-react";
import { Button } from "../../../../src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

interface AccountHeaderProps {
  user: {
    balance: string;
    initials: string;
    currency?: string;
  };
}

export default function AccountHeader({ user }: AccountHeaderProps) {
  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logging out...");
  };

  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold">Payments</h1>
        <p className="text-gray-500 mt-1">Make or receive payments instantly</p>
      </div>
      <div className="mt-4 md:mt-0 flex items-center gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-2 px-4 flex items-center">
          <div className="mr-3">
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="font-semibold text-lg">
              {user.balance} <span className="text-sm text-gray-500">{user.currency || 'USD'}</span>
            </p>
          </div>
          <CreditCard className="text-gray-400 ml-2 text-xl" />
        </div>
        <Button variant="outline" size="icon" className="bg-white border-gray-200 hover:bg-gray-50">
          <Bell className="h-5 w-5 text-gray-700" />
        </Button>
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center bg-white border-gray-200 hover:bg-gray-50 p-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <span>{user.initials}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <Link href="/dashboard">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
