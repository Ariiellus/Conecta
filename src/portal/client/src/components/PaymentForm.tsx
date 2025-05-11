import { Button } from "../../src/components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowDown, ArrowUp, Contact2 } from "lucide-react";

interface PaymentFormProps {
  mode: "send" | "receive";
  setMode: (mode: "send" | "receive") => void;
  transactionData: {
    amount: string;
    recipient: string;
    note: string;
  };
  setTransactionData: (data: {
    amount: string;
    recipient: string;
    note: string;
  }) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export default function PaymentForm({
  mode,
  setMode,
  transactionData,
  setTransactionData,
  onConfirm,
  isPending
}: PaymentFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For amount field, only allow numbers and a single decimal point
    if (name === "amount") {
      // Allow empty string, numbers, and decimal points (only one)
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setTransactionData({ ...transactionData, [name]: value });
      }
      return;
    }
    
    setTransactionData({ ...transactionData, [name]: value });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8">
      {/* Toggle Send/Receive */}
      <div className="mb-8 flex justify-center">
        <div className="bg-gray-100 rounded-lg p-1 inline-flex">
          <button 
            onClick={() => setMode("send")}
            className={`py-2 px-8 rounded-lg font-medium transition-colors ${
              mode === "send" 
                ? "bg-primary text-white" 
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Send
          </button>
          <button 
            onClick={() => setMode("receive")}
            className={`py-2 px-8 rounded-lg font-medium transition-colors ${
              mode === "receive" 
                ? "bg-primary text-white" 
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Receive
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Amount Field */}
        <div>
          <Label htmlFor="amount" className="text-sm font-medium text-gray-700 mb-1">
            Amount
          </Label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <Input
              type="text"
              name="amount"
              id="amount"
              value={transactionData.amount}
              onChange={handleChange}
              className="pl-7 pr-12 h-12"
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
        </div>

        {/* Recipient Field */}
        <div>
          <Label htmlFor="recipient" className="text-sm font-medium text-gray-700 mb-1">
            {mode === "send" ? "Recipient" : "Request From"}
          </Label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <Input
              type="text"
              name="recipient"
              id="recipient"
              value={transactionData.recipient}
              onChange={handleChange}
              className="rounded-r-none h-12"
              placeholder="Email or phone number"
            />
            <Button 
              type="button" 
              variant="outline" 
              className="rounded-l-none border-l-0 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100"
            >
              <Contact2 className="mr-2 h-4 w-4" />
              <span>Contacts</span>
            </Button>
          </div>
        </div>

        {/* Note Field (Optional) */}
        <div>
          <Label htmlFor="note" className="text-sm font-medium text-gray-700 mb-1">
            Note (Optional)
          </Label>
          <div className="mt-1">
            <Input
              type="text"
              name="note"
              id="note"
              value={transactionData.note}
              onChange={handleChange}
              className="h-12"
              placeholder="What's this payment for?"
            />
          </div>
        </div>

        {/* Confirm Button */}
        <div className="mt-8">
          <Button 
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="w-full py-6 h-auto text-base font-medium bg-primary hover:bg-primary-dark"
          >
            {isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              mode === "send" ? "Confirm Payment" : "Request Payment"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
