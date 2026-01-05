import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard } from "lucide-react";
import { SiPaypal, SiApplepay } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useWallet, useTransactions, useWithdraw } from "@/hooks/useWallet";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

import { useAuthContext } from "@/contexts/AuthContext";

export default function Wallet() {
  const { toast } = useToast();
  const [amount, setAmount] = useState("100.00");
  const [selectedPayment, setSelectedPayment] = useState<string>("paypal");
  const currencySymbol = getCurrencySymbol();
  
  const { user: authData } = useAuthContext();
  const fuelFriendId = authData?.fuelFriend?.id;
  
  // Add loading check for fuelFriendId
  if (!fuelFriendId) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const { data: wallet, isLoading: isLoadingWallet } = useWallet(fuelFriendId);
  const { data: transactions = [], isLoading: isLoadingTransactions } = useTransactions(fuelFriendId);
  const withdrawMutation = useWithdraw();

  const quickAmounts = ["100.00", "300.00", "500.00"];

  const handleWithdraw = async () => {
    if (!wallet) return;
    
    // Validate amount
    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than zero",
        variant: "destructive",
      });
      return;
    }

    // Check if amount is available in wallet
    const walletBalance = parseFloat(wallet.balance || "0");
    if (amountFloat > walletBalance) {
      toast({
        title: "Insufficient Funds",
        description: "The withdrawal amount exceeds your available balance",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await withdrawMutation.mutateAsync({
        amount,
        email: authData?.fuelFriend?.email || "",
        method: selectedPayment,
      });
      
      if (result.success) {
        toast({
          title: "Withdrawal Initiated",
          description: `${formatCurrency(amount)} withdrawal to ${selectedPayment.replace('-', ' ')} has been initiated successfully`,
        });
        setAmount("100.00");
      } else {
        throw new Error(result.error || "Failed to process withdrawal");
      }
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Failed to process withdrawal",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[hsl(var(--completed))] text-[hsl(var(--completed-foreground))]";
      case "confirmed":
        return "bg-[hsl(var(--active))] text-[hsl(var(--active-foreground))]";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Get payment method display name
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "paypal": return "PayPal";
      case "credit-card": return "Credit Card";
      case "apple-pay": return "Apple Pay";
      default: return method;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">My Wallet</h1>

        {/* Card */}
        {isLoadingWallet ? (
          <Skeleton className="h-48 w-full rounded-2xl" />
        ) : wallet ? (
          <Card className="relative overflow-hidden p-6 rounded-2xl border-0 bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))]">
            <div className="space-y-4 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm opacity-90">{wallet.bankName || "BANK NAME"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-90">Available Balance</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(wallet.balance ? parseFloat(wallet.balance) : 0)}</p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xl tracking-wider font-mono">{wallet.cardNumber || "•••• •••• •••• ••••"}</p>
              </div>

              {wallet.expiryDate && wallet.cvv && (
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="opacity-75">Expire {wallet.expiryDate}</p>
                  </div>
                  <div>
                    <p className="opacity-75">CVV Code {wallet.cvv}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">Wallet not found</p>
        )}

        {/* Withdraw Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Set Amount</h3>
            <p className="text-sm text-muted-foreground">Enter an amount to Withdraw</p>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-foreground">
              {currencySymbol}
            </span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-16 pl-10 text-2xl font-bold text-center rounded-lg"
              data-testid="input-amount"
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex gap-3">
            {quickAmounts.map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                onClick={() => setAmount(quickAmount)}
                className="flex-1 h-10 rounded-full font-semibold"
                data-testid={`button-amount-${quickAmount}`}
              >
                {formatCurrency(quickAmount)}
              </Button>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Withdraw to</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedPayment("paypal")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover-elevate ${
                  selectedPayment === "paypal"
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                data-testid="button-payment-paypal"
              >
                <SiPaypal className="w-8 h-8 text-[#0070BA]" />
                <span className="text-xs font-medium">Paypal</span>
              </button>

              <button
                onClick={() => setSelectedPayment("credit-card")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover-elevate ${
                  selectedPayment === "credit-card"
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                data-testid="button-payment-card"
              >
                <CreditCard className="w-8 h-8 text-foreground" />
                <span className="text-xs font-medium">Credit card</span>
              </button>

              <button
                onClick={() => setSelectedPayment("apple-pay")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover-elevate ${
                  selectedPayment === "apple-pay"
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                data-testid="button-payment-apple"
              >
                <SiApplepay className="w-8 h-8 text-foreground" />
                <span className="text-xs font-medium">Apple Pay</span>
              </button>
            </div>
          </div>

          <Button
            onClick={handleWithdraw}
            className="w-full h-12 text-base font-semibold rounded-lg"
            disabled={withdrawMutation.isPending || isLoadingWallet}
            data-testid="button-withdraw"
          >
            {withdrawMutation.isPending ? "Processing..." : "Withdraw Now"}
          </Button>
          
          <div className="text-xs text-muted-foreground text-center">
            <p>Note: Withdrawals are processed within 1-3 business days</p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Transaction history</h3>
            <Button
              variant="ghost"
              className="text-primary p-0 h-auto"
              data-testid="link-see-all-transactions"
            >
              See all
            </Button>
          </div>

          <div className="space-y-3">
            {isLoadingTransactions ? (
              <>
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </>
            ) : transactions.length > 0 ? (
              transactions.slice(0, 5).map((transaction) => (
                <Card key={transaction.id} className="p-4 border-card-border rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-foreground capitalize">
                        {transaction.type.replace("_", " ")} to {getPaymentMethodName(transaction.type === "withdrawal" ? selectedPayment : "unknown")}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {transaction.date} {transaction.time}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-base font-bold text-foreground">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <Badge className={`rounded-full px-3 py-0.5 text-xs capitalize ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}