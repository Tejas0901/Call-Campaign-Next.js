'use client';

import { useState, useEffect } from 'react';
import { useApiCall } from './useApiCall';
import {
  BalanceData,
  TransactionHistoryResponse,
  UsageResponse,
  InvoiceListResponse,
  InvoiceDetailResponse,
  BillingSettings,
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyTopupRequest,
  VerifyTopupResponse,
  UpdateSettingsRequest,
  Transaction,
  UsageRecord,
  Invoice,
  InvoiceDetail
} from '@/types/billing';

/**
 * Custom hook for billing API interactions
 */
export function useBilling() {
  const { call, loading, error, clearError } = useApiCall();
  
  // Fetch balance data
  const fetchBalance = async (): Promise<BalanceData | null> => {
    return call(async () => {
      const response = await fetch('/api/billing/balance');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.detail || 'Failed to fetch balance');
      }
      
      return data.data;
    });
  };

  // Fetch transaction history
  const fetchTransactionHistory = async (
    skip: number = 0,
    limit: number = 50,
    type?: 'CREDIT' | 'DEBIT'
  ): Promise<TransactionHistoryResponse | null> => {
    return call(async () => {
      let url = `/api/billing/transactions?skip=${skip}&limit=${limit}`;
      if (type) url += `&type=${type}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.detail || 'Failed to fetch transaction history');
      }
      
      return data.data;
    });
  };

  // Fetch usage records
  const fetchUsageRecords = async (
    skip: number = 0,
    limit: number = 50,
    campaignId?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<UsageResponse | null> => {
    return call(async () => {
      let url = `/api/billing/usage?skip=${skip}&limit=${limit}`;
      if (campaignId) url += `&campaign_id=${campaignId}`;
      if (dateFrom) url += `&date_from=${dateFrom}`;
      if (dateTo) url += `&date_to=${dateTo}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.detail || 'Failed to fetch usage records');
      }
      
      return data.data;
    });
  };

  // Fetch invoices
  const fetchInvoices = async (): Promise<InvoiceListResponse | null> => {
    return call(async () => {
      const response = await fetch('/api/billing/invoices');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.detail || 'Failed to fetch invoices');
      }
      
      return data.data;
    });
  };

  // Fetch invoice detail
  const fetchInvoiceDetail = async (invoiceId: string): Promise<InvoiceDetailResponse | null> => {
    return call(async () => {
      const response = await fetch(`/api/billing/invoices/${invoiceId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.detail || 'Failed to fetch invoice detail');
      }
      
      return data.data;
    });
  };

  // Generate invoice
  const generateInvoice = async (year: number, month: number): Promise<Invoice | null> => {
    return call(async () => {
      const response = await fetch(`/api/billing/invoices?year=${year}&month=${month}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.detail || 'Failed to generate invoice');
      }
      
      return data.data.invoice;
    });
  };

  // Update billing settings
  const updateSettings = async (settings: UpdateSettingsRequest): Promise<BillingSettings | null> => {
    return call(async () => {
      const response = await fetch('/api/billing/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.detail || 'Failed to update settings');
      }
      
      return data.data;
    });
  };

  // Create top-up order
  const createTopupOrder = async (request: CreateOrderRequest): Promise<CreateOrderResponse | null> => {
    return call(async () => {
      const response = await fetch('/api/billing/topup/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.detail || 'Failed to create top-up order');
      }
      
      return data.data;
    });
  };

  // Verify top-up
  const verifyTopup = async (request: VerifyTopupRequest): Promise<VerifyTopupResponse | null> => {
    return call(async () => {
      const response = await fetch('/api/billing/topup/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.detail || 'Failed to verify top-up');
      }
      
      return data.data;
    });
  };

  return {
    // Data fetching functions
    fetchBalance,
    fetchTransactionHistory,
    fetchUsageRecords,
    fetchInvoices,
    fetchInvoiceDetail,
    generateInvoice,
    updateSettings,
    createTopupOrder,
    verifyTopup,
    
    // Status indicators
    loading,
    error,
    clearError
  };
}