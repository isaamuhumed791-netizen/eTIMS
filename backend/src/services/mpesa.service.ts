import axios, { type AxiosInstance } from "axios";
import { env } from "../lib/env.js";
import { logger } from "../lib/logger.js";
import { decrypt } from "../lib/crypto.js";
import type { Tenant } from "@prisma/client";

export interface StkPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

interface MpesaCreds {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  shortcode: string;
  baseUrl: string;
}

class MpesaService {
  private tokenCache = new Map<string, { token: string; expiresAt: number }>();

  private buildClient(baseUrl: string): AxiosInstance {
    return axios.create({
      baseURL: baseUrl,
      timeout: 30_000,
      headers: { "Content-Type": "application/json" },
    });
  }

  private resolveCredsFromTenant(tenant: Tenant): MpesaCreds {
    if (!tenant.mpesaConsumerKeyEnc || !tenant.mpesaConsumerSecretEnc || !tenant.mpesaPasskeyEnc || !tenant.mpesaShortcode) {
      throw new Error("Tenant has no M-Pesa credentials configured");
    }
    const baseUrl =
      tenant.mpesaEnv === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";
    return {
      consumerKey: decrypt(tenant.mpesaConsumerKeyEnc),
      consumerSecret: decrypt(tenant.mpesaConsumerSecretEnc),
      passkey: decrypt(tenant.mpesaPasskeyEnc),
      shortcode: tenant.mpesaShortcode,
      baseUrl,
    };
  }

  private resolveCredsFromEnv(): MpesaCreds {
    if (!env.MPESA_CONSUMER_KEY || !env.MPESA_CONSUMER_SECRET || !env.MPESA_PASSKEY || !env.MPESA_SHORTCODE) {
      throw new Error("M-Pesa env credentials not configured");
    }
    return {
      consumerKey: env.MPESA_CONSUMER_KEY,
      consumerSecret: env.MPESA_CONSUMER_SECRET,
      passkey: env.MPESA_PASSKEY,
      shortcode: env.MPESA_SHORTCODE,
      baseUrl: env.MPESA_BASE_URL,
    };
  }

  async getAccessToken(creds: MpesaCreds): Promise<string> {
    const cacheKey = creds.consumerKey;
    const cached = this.tokenCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now() + 30_000) return cached.token;

    const basic = Buffer.from(`${creds.consumerKey}:${creds.consumerSecret}`).toString("base64");
    const client = this.buildClient(creds.baseUrl);
    const { data } = await client.get(
      "/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${basic}` } }
    );

    const expiresIn = Number(data.expires_in ?? 3599);
    const token = data.access_token as string;
    this.tokenCache.set(cacheKey, { token, expiresAt: Date.now() + expiresIn * 1000 });
    return token;
  }

  /**
   * Public helper — validates raw credentials by requesting an OAuth token.
   * Used during onboarding to test creds before saving.
   */
  async testCredentials(consumerKey: string, consumerSecret: string, environment: "sandbox" | "production") {
    const baseUrl =
      environment === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";
    const basic = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const client = this.buildClient(baseUrl);
    const { data } = await client.get(
      "/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${basic}` } }
    );
    return { accessToken: data.access_token as string, expiresIn: Number(data.expires_in ?? 3599) };
  }

  private timestamp(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  }

  async stkPush(
    req: StkPushRequest,
    options: { tenant?: Tenant; callbackUrl?: string }
  ) {
    const creds = options.tenant
      ? this.resolveCredsFromTenant(options.tenant)
      : this.resolveCredsFromEnv();
    const token = await this.getAccessToken(creds);
    const ts = this.timestamp();
    const password = Buffer.from(`${creds.shortcode}${creds.passkey}${ts}`).toString("base64");

    const callbackUrl = options.callbackUrl || env.MPESA_CALLBACK_URL;
    const client = this.buildClient(creds.baseUrl);
    const payload = {
      BusinessShortCode: creds.shortcode,
      Password: password,
      Timestamp: ts,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(req.amount),
      PartyA: req.phoneNumber,
      PartyB: creds.shortcode,
      PhoneNumber: req.phoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: req.accountReference,
      TransactionDesc: req.transactionDesc,
    };

    const { data } = await client.post("/mpesa/stkpush/v1/processrequest", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    logger.info({ CheckoutRequestID: data.CheckoutRequestID }, "STK Push initiated");
    return data;
  }
}

export const mpesaService = new MpesaService();