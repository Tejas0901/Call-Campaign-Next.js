"use client";

import { useState, useEffect } from "react";
import { useBilling } from "@/hooks/useBilling";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IndianRupee } from "lucide-react";

interface UsageRecordsProps {
  limit?: number;
}

export default function UsageRecords({ limit = 10 }: UsageRecordsProps) {
  const { fetchUsageRecords, loading, error } = useBilling();
  const [usageRecords, setUsageRecords] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadUsageRecords = async () => {
      const result = await fetchUsageRecords(currentPage * limit, limit);
      if (result) {
        setUsageRecords(result.usage);
        setTotal(result.count);
      }
    };

    loadUsageRecords();
  }, [currentPage, limit]);

  const totalPages = Math.ceil(total / limit);

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
    });
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">
            Error loading usage records: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading && usageRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Call SID</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Billed</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(limit)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
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
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Records</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Call SID</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Billed</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usageRecords.length > 0 ? (
              usageRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono">{record.call_sid}</TableCell>
                  <TableCell>
                    {formatDuration(record.duration_seconds)}
                  </TableCell>
                  <TableCell>{record.billable_minutes} min</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span>{record.rate_per_minute.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span>{record.amount_charged.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(record.created_at)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-gray-500 py-8"
                >
                  No usage records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>

            <span className="text-sm text-gray-500">
              Page {currentPage + 1} of {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
              }
              disabled={currentPage === totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
