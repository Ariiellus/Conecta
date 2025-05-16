import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { thirdwebSDK } from "@/lib/thirdweb";
import { usePrivy } from "@privy-io/react-auth";
import { parseEther } from "viem";

export function NebulaButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const { toast } = useToast();
  const { user, sendTransaction } = usePrivy();

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message to send to Nebula AI",
        variant: "destructive",
      });
      return;
    }

    if (!user?.wallet?.address) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Call Nebula API
      const response = await fetch("https://nebula-api.thirdweb.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-secret-key": process.env.THIRDWEB_SECRET_KEY || '',
        } satisfies Record<string, string>,
        body: JSON.stringify({
          message: message,
          execute_config: {
            mode: "client",
            chain_id: 11155111, // Sepolia testnet
            signer_wallet_address: user.wallet.address,
          },
        }),
      });
      
      const data = await response.json();
      setResponse(data.message);
      
      // If there's a transaction to execute
      if (data.message.includes("transfer of")) {
        // Extract transaction details using regex
        const toMatch = data.message.match(/\*\*To:\*\* \[`(0x[a-fA-F0-9]{40})`\]/);
        const amountMatch = data.message.match(/\*\*Amount:\*\* ([\d.]+) ETH/);
        
        console.log("Parsing response:", {
          toMatch,
          amountMatch,
          message: data.message
        });

        if (toMatch && amountMatch) {
          const to = toMatch[1];
          const ethAmount = amountMatch[1];
          
          console.log("Parsed values:", {
            to,
            ethAmount
          });

          try {
            // Convert ETH to wei
            const value = parseEther(ethAmount);
            
            console.log("Transaction details:", {
              to,
              value: value.toString(),
              chainId: 11155111
            });

            // Ask user for confirmation
            const confirmTx = window.confirm(`Would you like to proceed with sending ${ethAmount} ETH to ${to}?`);
            
            if (confirmTx) {
              // Send the transaction using Privy
              const txHash = await sendTransaction({
                to,
                value: value.toString(),
                chainId: 11155111, // Sepolia
              });
              
              console.log("Transaction sent:", txHash);
              
              toast({
                title: "Transaction Sent",
                description: "Your transaction has been initiated. Check your wallet for confirmation.",
              });
            }
          } catch (error) {
            console.error("Error processing transaction:", error);
            toast({
              title: "Transaction Error",
              description: "Failed to process the transaction. Please check the amount and try again.",
              variant: "destructive",
            });
          }
        } else {
          console.error("Failed to parse transaction details", {
            messageContent: data.message,
            toMatchResult: toMatch,
            amountMatchResult: amountMatch
          });
          
          toast({
            title: "Parse Error",
            description: "Could not parse transaction details from the response.",
            variant: "destructive",
          });
        }
      }
      
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to process the request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2 rounded-full bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 p-4"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-5 w-5" />
        <span className="hidden md:inline">AI Assistant</span>
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span>Nebula AI Assistant</span>
            </DialogTitle>
          </DialogHeader>
          
          {response && (
            <div className="bg-gray-50 p-4 rounded-md mb-4 max-h-[200px] overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{response}</p>
            </div>
          )}
          
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="message">Ask anything about crypto or payments</Label>
              <Input
                id="message"
                placeholder="e.g., Send 0.001 ETH to ariellus.eth"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleSendMessage}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Send to Nebula AI"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 