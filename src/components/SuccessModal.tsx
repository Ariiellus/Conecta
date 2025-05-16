import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, FileText } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  transactionTime: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  transactionId,
  transactionTime
}: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-green-500 h-8 w-8" />
          </div>
          
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</DialogTitle>
          </DialogHeader>
          
          <p className="text-gray-500 mb-6">Your payment has been sent successfully.</p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-3">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-semibold">{transactionId || "TX-" + Math.floor(Math.random() * 100000000)}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-500">Date & Time</span>
              <span className="font-semibold">{transactionTime || new Date().toLocaleString()}</span>
            </div>
          </div>
          
          <DialogFooter className="flex flex-row gap-3 sm:gap-3">
            <Button
              variant="outline"
              className="flex-1 flex justify-center items-center"
            >
              <FileText className="mr-2 h-4 w-4" />
              View Receipt
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-primary hover:bg-primary-dark"
            >
              Done
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
