"use client";
import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/signup") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email?: string;
  tin?: string | null;
  bhfId?: string | null;
  dvcSrlNo?: string | null;
  etimsConnectedAt?: string | null;
  mpesaShortcode?: string | null;
  mpesaEnv?: string | null;
  mpesaConnectedAt?: string | null;
}

export interface MeResponse {
  user: User;
  tenant: Tenant;
}

export interface TenantStatus {
  tenant: { id: string; name: string; slug: string; email: string };
  etims: {
    connected: boolean;
    tin?: string | null;
    bhfId?: string | null;
    dvcSrlNo?: string | null;
    connectedAt?: string | null;
  };
  mpesa: {
    connected: boolean;
    shortcode?: string | null;
    environment?: string | null;
    connectedAt?: string | null;
  };
}

export interface Invoice {
  id: string;
  tenantId: string;
  transactionId: string;
  kraInvoiceNumber?: string | null;
  sdcId?: string | null;
  status: "QUEUED" | "SUBMITTED" | "FAILED";
  errorMessage?: string | null;
  retryCount: number;
  createdAt: string;
  transaction: {
    id: string;
    mpesaReceiptNumber?: string | null;
    checkoutRequestId?: string | null;
    amount: string;
    phoneNumber: string;
    status: "PENDING" | "SUCCESS" | "FAILED";
    createdAt: string;
  };
}

export interface StatsSummary {
  invoices: { total: number; submitted: number; failed: number; queued: number };
  transactions: { successCount: number; successAmount: number };
}