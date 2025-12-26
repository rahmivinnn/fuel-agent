import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CreditCard, TrendingUp, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { SiPaypal, SiApplepay } from "react-icons/si";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useWallet, useTransactions, useWithdraw } from "@/hooks/useWallet";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import { MobileContainer } from "@/components/MobileContainer";
import { motion } from "framer-motion";

export default function Wallet() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [amount, setAmount] = useState("100.00");
  const [selectedPayment, setSelectedPayment] = useState<string>("paypal");
  const currencySymbol = getCurrencySymbol();
  
  const driverId = localStorage.getItem("driverId") || "ff1";
  
  const { data: wallet, isLoading: isLoadingWallet } = useWallet(driverId);
  const { data: transactions = [], isLoading: isLoadingTransactions } = useTransactions(driverId);
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
        driverId,
        amount,
        paymentMethod: selectedPayment,
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
    <div className="min-h-screen bg-white pb-20">
      <MobileContainer>
        {/* Header */}
        <div className="flex items-center gap-4 py-4 border-b border-gray-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            className="text-gray-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">My Wallet</h1>
        </div>

        <div className="py-6 space-y-6">
          {/* Wallet Card */}
          {isLoadingWallet ? (
            <Skeleton className="h-48 w-full rounded-2xl" />
          ) : wallet ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="relative overflow-hidden p-6 rounded-2xl border-0 bg-gradient-to-br from-green-500 to-green-700 text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
                
                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-green-100 text-sm">{wallet.bankName || "FuelFriendly Wallet"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <WalletIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Driver Account</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-100 text-xs">Available Balance</p>
                      <p className="text-3xl font-bold mt-1">{formatCurrency(wallet.balance ? parseFloat(wallet.balance) : 0)}</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-xl tracking-wider font-mono opacity-90">{wallet.cardNumber || "•••• •••• •••• ••••"}</p>
                  </div>

                  {wallet.expiryDate && wallet.cvv && (
                    <div className="flex items-center gap-6 text-sm opacity-90">
                      <div>
                        <p>Expire {wallet.expiryDate}</p>
                      </div>
                      <div>
                        <p>CVV {wallet.cvv}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <WalletIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Wallet not found</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600">This Month</p>
                  <p className="text-lg font-bold text-blue-700">$1,247</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-orange-50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-orange-600">Withdrawn</p>
                  <p className="text-lg font-bold text-orange-700">$850</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Withdraw Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Withdraw Funds</h3>
              <p className="text-sm text-gray-600">Enter amount to withdraw</p>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-700">
                {currencySymbol}
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-16 pl-10 text-2xl font-bold text-center rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
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
                  className="flex-1 h-10 rounded-full font-semibold border-green-200 text-green-700 hover:bg-green-50"
                  data-testid={`button-amount-${quickAmount}`}
                >
                  {formatCurrency(quickAmount)}
                </Button>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Withdraw to</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedPayment("paypal")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedPayment === "paypal"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  data-testid="button-payment-paypal"
                >
                  <SiPaypal className="w-8 h-8 text-[#0070BA]" />
                  <span className="text-xs font-medium">PayPal</span>
                </button>

                <button
                  onClick={() => setSelectedPayment("credit-card")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedPayment === "credit-card"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  data-testid="button-payment-card"
                >
                  <CreditCard className="w-8 h-8 text-gray-700" />
                  <span className="text-xs font-medium">Credit Card</span>
                </button>

                <button
                  onClick={() => setSelectedPayment("apple-pay")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedPayment === "apple-pay"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  data-testid="button-payment-apple"
                >
                  <SiApplepay className="w-8 h-8 text-gray-700" />
                  <span className="text-xs font-medium">Apple Pay</span>
                </button>
              </div>
            </div>

            <Button
              onClick={handleWithdraw}
              className="w-full h-12 text-base font-semibold rounded-xl bg-green-500 hover:bg-green-600"
              disabled={withdrawMutation.isPending || isLoadingWallet}
              data-testid="button-withdraw"
            >
              {withdrawMutation.isPending ? "Processing..." : "Withdraw Now"}
            </Button>
            
            <div className="text-xs text-gray-500 text-center bg-gray-50 rounded-lg p-3">
              <p>💡 Withdrawals are processed within 1-3 business days</p>
            </div>
          </motion.div>

          {/* Transaction History */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <Button
                variant="ghost"
                className="text-green-600 p-0 h-auto hover:text-green-700"
                data-testid="link-see-all-transactions"
              >
                See all
              </Button>
            </div>

            <div className="space-y-3">
              {isLoadingTransactions ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                transactions.slice(0, 5).map((transaction) => (
                  <Card key={transaction.id} className="p-4 border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'withdrawal' ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          {transaction.type === 'withdrawal' ? (
                            <ArrowDownLeft className="w-5 h-5 text-red-600" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-gray-900 capitalize">
                            {transaction.type.replace("_", " ")}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {transaction.date} • {transaction.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-base font-bold ${
                          transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transaction.type === 'withdrawal' ? '-' : '+'}{formatCurrency(transaction.amount)}
                        </p>
                        <Badge className={`rounded-full px-2 py-0.5 text-xs capitalize ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="bg-gray-50 rounded-2xl p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">No Transactions Yet</h4>
                  <p className="text-sm text-gray-600">Your transaction history will appear here</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </MobileContainer>
      <BottomNav />
    </div>
  );
}