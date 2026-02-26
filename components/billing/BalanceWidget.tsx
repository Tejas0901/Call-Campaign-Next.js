"use client";

import { useEffect, useState } from "react";
import { useBilling } from "@/hooks/useBilling";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  IndianRupee,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface BalanceWidgetProps {
  onTopUpClick?: () => void;
}

export default function BalanceWidget({ onTopUpClick }: BalanceWidgetProps) {
  const { fetchBalance, loading, error, clearError } = useBilling();
  const [balanceData, setBalanceData] = useState<any>(null);

  useEffect(() => {
    const loadBalance = async () => {
      const data = await fetchBalance();
      if (data) {
        setBalanceData(data);
      }
    };

    loadBalance();
  }, []);

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading || !balanceData) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Wallet Balance</CardTitle>
          <CardDescription>
            Current balance and usage statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    balance,
    currency,
    rate_per_minute,
    low_balance_threshold,
    is_low_balance,
    this_month_calls,
    this_month_minutes,
    this_month_spend,
  } = balanceData;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Wallet Balance</CardTitle>
        <CardDescription>Current balance and usage statistics</CardDescription>
      </CardHeader>
      <CardContent>
        {is_low_balance && (
          <Alert className="mb-4 bg-orange-50 border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Your balance ({currency}
              {balance.toFixed(2)}) is below {currency}
              {low_balance_threshold}. Top up to avoid call interruptions.
              <Button
                variant="outline"
                size="sm"
                className="ml-2 text-orange-700 border-orange-300 hover:bg-orange-100"
                onClick={onTopUpClick}
              >
                Top Up Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-4">
          <div className="text-3xl font-bold">
            <IndianRupee className="inline-block h-6 w-6 mr-1" />
            {balance.toFixed(2)}
          </div>
          <Button onClick={onTopUpClick}>
            <IndianRupee className="mr-2 h-4 w-4" />
            Top Up
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="border-l-2 border-gray-200 pl-3">
            <div className="text-gray-500">Rate</div>
            <div className="font-medium">
              {currency}
              {rate_per_minute.toFixed(2)}/min
            </div>
          </div>
          <div className="border-l-2 border-gray-200 pl-3">
            <div className="text-gray-500">This Month</div>
            <div className="font-medium">{this_month_calls} calls</div>
          </div>
          <div className="border-l-2 border-gray-200 pl-3">
            <div className="text-gray-500">Minutes</div>
            <div className="font-medium">{this_month_minutes} min</div>
          </div>
          <div className="border-l-2 border-gray-200 pl-3">
            <div className="text-gray-500">Spent</div>
            <div className="font-medium">
              {currency}
              {this_month_spend.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
