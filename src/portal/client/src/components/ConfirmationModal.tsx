import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../../../../src/components/ui/button";
import { X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionData: {
    amount: string;
    recipient: string;
    note: string;
  };
  onConfirm: () => void;
  isPending: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  transactionData,
  onConfirm,
  isPending
}: ConfirmationModalProps) {
  const formattedAmount = transactionData.amount 
    ? `$${Number(transactionData.amount).toFixed(2)}` 
    : "$0.00";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="flex justify-between items-start">
          <DialogTitle className="text-lg font-semibold text-gray-900">Confirm Payment</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-gray-500 absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-3">
              <span className="text-gray-500">Amount</span>
              <span className="font-semibold">{formattedAmount}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-500">To</span>
              <span className="font-semibold">{transactionData.recipient || "No recipient"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fee</span>
              <span className="font-semibold text-green-500">Free</span>
            </div>
          </div>
          
          <DialogDescription className="mt-6 text-gray-500 text-sm mb-6">
            By confirming this payment, you agree to our terms and conditions regarding electronic fund transfers.
          </DialogDescription>
          
          <DialogFooter className="flex flex-row gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 bg-primary hover:bg-primary-dark"
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
                "Send Payment"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
