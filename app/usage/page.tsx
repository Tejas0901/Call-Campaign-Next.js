"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import MainLayout from "@/components/layouts/MainLayout";
import { useBilling } from "@/hooks/useBilling";
import { UsageRecord } from "@/types/billing";
import { Phone, PhoneCall, Clock, IndianRupee } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsagePage() {
  const { fetchUsageRecords, loading, error } = useBilling();
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadUsageRecords = async () => {
      // Fetch all records (limit=1000) to get complete data for stats
      const result = await fetchUsageRecords(0, 1000);
      if (result && result.usage) {
        setUsageRecords(result.usage);
        setTotal(result.count);
      }
    };

    loadUsageRecords();
  }, [fetchUsageRecords]);

  // Calculate stats from all usage data
  const totalCalls = total ?? 0; // Use total count from API
  const totalDuration =
    usageRecords?.reduce((sum, r) => sum + r.duration_seconds, 0) || 0;
  const totalBillableMinutes =
    usageRecords?.reduce((sum, r) => sum + r.billable_minutes, 0) || 0;
  const totalAmount =
    usageRecords?.reduce((sum, r) => sum + r.amount_charged, 0) || 0;

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statsData = [
    {
      title: "Total Calls",
      value: totalCalls.toString(),
      icon: Phone,
      color: "text-blue-500",
    },
    {
      title: "Total Duration",
      value: formatDuration(totalDuration),
      icon: Clock,
      color: "text-green-500",
    },
    {
      title: "Billable Minutes",
      value: `${totalBillableMinutes} min`,
      icon: PhoneCall,
      color: "text-orange-500",
    },
    {
      title: "Total Charged",
      value: `₹${totalAmount.toFixed(2)}`,
      icon: IndianRupee,
      color: "text-purple-500",
    },
  ];

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <PageHeader title="Usage" />
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error loading usage data: {error}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <PageHeader title="Usage" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading && (!usageRecords || usageRecords.length === 0)
            ? [...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow p-6 border border-gray-200"
                >
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            : statsData.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow p-6 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {item.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {item.value}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg bg-gray-100`}>
                        <Icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Usage Records
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Call SID</TableHead>
                  <TableHead>Campaign ID</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Billed</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (!usageRecords || usageRecords.length === 0) ? (
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : usageRecords && usageRecords.length > 0 ? (
                  usageRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-xs">
                        {record.call_sid}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {record.campaign_id?.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {formatDuration(record.duration_seconds)}
                      </TableCell>
                      <TableCell>{record.billable_minutes} min</TableCell>
                      <TableCell>
                        ₹{record.rate_per_minute.toFixed(2)}
                      </TableCell>
                      <TableCell>₹{record.amount_charged.toFixed(2)}</TableCell>
                      <TableCell>{formatDate(record.created_at)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-gray-500 py-8"
                    >
                      No usage records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Show total count */}
          {usageRecords && usageRecords.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              Showing all {usageRecords.length} usage records
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
