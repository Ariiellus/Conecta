import { ArrowUp, ArrowDown } from "lucide-react";
import { Transaction } from "client/shared/schema";
import { formatDistanceToNow } from "date-fns";

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const isReceived = transaction.type === "receive";
  const formattedAmount = `${isReceived ? "+" : "-"}$${transaction.amount.toFixed(2)}`;
  const timeAgo = formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true });
  
  return (
    <li className="mb-3 transaction-item p-3 rounded-lg cursor-pointer hover:bg-primary hover:bg-opacity-5">
      <div className="flex items-center">
        <div className={`w-9 h-9 rounded-full ${isReceived ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center flex-shrink-0`}>
          {isReceived ? (
            <ArrowDown className="text-green-500 h-4 w-4" />
          ) : (
            <ArrowUp className="text-red-500 h-4 w-4" />
          )}
        </div>
        <div className="ml-3 flex-grow">
          <p className="text-sm font-medium">
            {isReceived ? `Received from ${transaction.recipient}` : `Sent to ${transaction.recipient}`}
          </p>
          <p className="text-xs text-gray-500">{timeAgo}</p>
        </div>
        <div className={isReceived ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
          {formattedAmount}
        </div>
      </div>
    </li>
  );
}
