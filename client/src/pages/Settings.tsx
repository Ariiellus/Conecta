import { useState } from "react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CURRENCIES } from "@/hooks/useCurrencyConversion";
import { AlertCircle, Check, ExternalLink, KeyRound, CreditCard, Shield, Wallet, Loader2 } from "lucide-react";

export default function Settings() {
  const { preferences, isLoading, updatePreferences, isUpdating } = useUserPreferences();
  const { toast } = useToast();
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showTwoFactorSection, setShowTwoFactorSection] = useState(false);
  
  const handleCurrencyChange = (type: "send" | "receive", value: string) => {
    const updatedPreferences = type === "send" 
      ? { sendCurrency: value } 
      : { receiveCurrency: value };
    
    updatePreferences(updatedPreferences, {
      onSuccess: () => {
        toast({
          title: "Preferences Updated",
          description: `Your ${type} currency has been updated to ${value}.`
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update preferences: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleToggle2FA = () => {
    if (preferences.twoFactorEnabled) {
      // Disable 2FA
      updatePreferences({ twoFactorEnabled: false }, {
        onSuccess: () => {
          toast({
            title: "Two-Factor Authentication Disabled",
            description: "Your account is now less secure. We recommend enabling 2FA for better security."
          });
        }
      });
    } else {
      // Show 2FA setup section
      setShowTwoFactorSection(true);
    }
  };
  
  const handleSetup2FA = () => {
    // In a real app, we would validate the 2FA code here
    if (twoFactorCode.length !== 6 || !/^\d+$/.test(twoFactorCode)) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code.",
        variant: "destructive",
      });
      return;
    }
    
    updatePreferences({ twoFactorEnabled: true }, {
      onSuccess: () => {
        setShowTwoFactorSection(false);
        setTwoFactorCode("");
        toast({
          title: "Two-Factor Authentication Enabled",
          description: "Your account is now more secure."
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to enable 2FA: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleConnectStripe = () => {
    // In a real app, this would redirect to Stripe Connect OAuth flow
    updatePreferences({ stripeAccountId: "acct_mock123456" }, {
      onSuccess: () => {
        toast({
          title: "Stripe Connected",
          description: "Your Stripe account has been connected successfully."
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to connect Stripe: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleDisconnectStripe = () => {
    updatePreferences({ stripeAccountId: null }, {
      onSuccess: () => {
        toast({
          title: "Stripe Disconnected",
          description: "Your Stripe account has been disconnected."
        });
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Tabs defaultValue="currencies" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="currencies">
            <Wallet className="mr-2 h-4 w-4" />
            Currencies
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment Methods
          </TabsTrigger>
        </TabsList>
        
        {/* Currencies Tab */}
        <TabsContent value="currencies" className="space-y-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Currency Preferences</h2>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="send-currency">Send Currency</Label>
                <p className="text-gray-500 text-sm">Choose the default currency you want to use when sending money.</p>
                <Select 
                  value={preferences.sendCurrency || "USD"} 
                  onValueChange={(value) => handleCurrencyChange("send", value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger id="send-currency" className="w-full md:w-[250px]">
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="receive-currency">Receive Currency</Label>
                <p className="text-gray-500 text-sm">Choose the default currency you want to use when receiving money.</p>
                <Select 
                  value={preferences.receiveCurrency || "USD"} 
                  onValueChange={(value) => handleCurrencyChange("receive", value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger id="receive-currency" className="w-full md:w-[250px]">
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Two-Factor Authentication</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Enable Two-Factor Authentication</h3>
                <p className="text-gray-500 text-sm">Add an extra layer of security to your account.</p>
              </div>
              <Switch 
                checked={preferences.twoFactorEnabled || false} 
                onCheckedChange={handleToggle2FA}
                disabled={isUpdating}
              />
            </div>
            
            {showTwoFactorSection && !preferences.twoFactorEnabled && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium mb-4">Set Up Two-Factor Authentication</h3>
                
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Scan the QR code below with an authenticator app like Google Authenticator or Authy.
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border">
                    {/* In a real app, this would be a QR code */}
                    <KeyRound className="h-16 w-16" />
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-gray-700 mb-4">
                      After scanning the QR code, enter the 6-digit verification code from your authenticator app below.
                    </p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">Verification Code</Label>
                      <Input 
                        id="verification-code"
                        placeholder="Enter 6-digit code"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        maxLength={6}
                      />
                    </div>
                    
                    <div className="mt-4 flex space-x-3">
                      <Button onClick={handleSetup2FA} disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify and Enable"
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setShowTwoFactorSection(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {preferences.twoFactorEnabled && (
              <div className="mt-4 flex items-center text-green-600">
                <Check className="h-5 w-5 mr-2" />
                <span>Two-factor authentication is enabled</span>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Password</h2>
            
            <Button>
              <KeyRound className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          </div>
        </TabsContent>
        
        {/* Payment Methods Tab */}
        <TabsContent value="payments" className="space-y-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Connect Payment Methods</h2>
            
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium flex items-center">
                    <img src="https://www.vectorlogo.zone/logos/stripe/stripe-icon.svg" alt="Stripe" className="h-5 w-5 mr-2" />
                    Stripe
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Connect your Stripe account to send and receive money directly to your bank account.
                  </p>
                </div>
                
                {preferences.stripeAccountId ? (
                  <div>
                    <div className="flex items-center text-green-600 mb-3">
                      <Check className="h-5 w-5 mr-2" />
                      <span>Connected</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDisconnectStripe} disabled={isUpdating}>
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleConnectStripe} disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        Connect Stripe
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">More Payment Methods Coming Soon</h3>
                <p className="text-gray-500 text-sm">
                  We're working on adding more payment methods to make sending and receiving money even easier.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}