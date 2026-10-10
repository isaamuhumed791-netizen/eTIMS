import axios, { type AxiosInstance } from "axios";
import { env } from "../lib/env.js";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import { encrypt, decrypt } from "../lib/crypto.js";
import type { Transaction, Tenant } from "@prisma/client";

export interface TenantEtimsCreds {
  tin: string;
  bhfId: string;
  dvcSrlNo: string;
  cmcKey: string;
  baseUrl?: string;
}

export interface EtimsInitResult {
  cmcKey: string;
  sdcId?: string;
  info?: unknown;
}

export interface EtimsSubmitResult {
  kraInvoiceNumber: string;
  sdcId: string;
  receiptSignature: string;
}

class EtimsService {
  private client(baseUrl: string): AxiosInstance {
    return axios.create({
      baseURL: baseUrl || env.ETIMS_BASE_URL,
      timeout: 30_000,
      headers: { "Content-Type": "application/json" },
    });
  }

  /**
   * Called during onboarding — talks to KRA with raw creds (no cmcKey yet).
   * Returns the cmcKey and persists it (encrypted) on the Tenant.
   */
  async initializeDeviceForTenant(
    tenantId: string,
    creds: { tin: string; bhfId: string; dvcSrlNo: string; baseUrl?: string }
  ): Promise<EtimsInitResult> {
    const client = this.client(creds.baseUrl || env.ETIMS_BASE_URL);
    const payload = {
      tin: creds.tin,
      bhfId: creds.bhfId,
      dvcSrlNo: creds.dvcSrlNo,
    };

    logger.info({ tenantId, tin: creds.tin }, "Initializing eTIMS device");

    const { data } = await client.post("/selectInitOsdcInfo", payload);

    if (data?.resultCd !== "000") {
      throw new Error(
        `eTIMS init failed: ${data?.resultMsg ?? "Unknown"} (code ${data?.resultCd})`
      );
    }

    const cmcKey: string = data?.data?.cmcKey ?? data?.cmcKey;
    if (!cmcKey) throw new Error("eTIMS init: cmcKey missing in response");

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        tin: creds.tin,
        bhfId: creds.bhfId,
        dvcSrlNo: creds.dvcSrlNo,
        cmcKeyEnc: encrypt(cmcKey),
        etimsConnectedAt: new Date(),
      },
    });

    logger.info({ tenantId }, "eTIMS device initialized and cmcKey stored");
    return { cmcKey, sdcId: data?.data?.sdcId, info: data };
  }

  private async getCreds(tenant: Tenant): Promise<TenantEtimsCreds> {
    if (!tenant.cmcKeyEnc) throw new Error("Tenant has no eTIMS connection");
    return {
      tin: tenant.tin ?? "",
      bhfId: tenant.bhfId ?? "00",
      dvcSrlNo: tenant.dvcSrlNo ?? "",
      cmcKey: decrypt(tenant.cmcKeyEnc),
    };
  }

  async submitSalesInvoice(
    tenant: Tenant,
    transaction: Transaction
  ): Promise<EtimsSubmitResult> {
    const creds = await this.getCreds(tenant);
    const client = this.client(env.ETIMS_BASE_URL);
    const amount = Number(transaction.amount);
    const taxRate = 0.16;
    const taxableAmt = +(amount / (1 + taxRate)).toFixed(2);
    const taxAmt = +(amount - taxableAmt).toFixed(2);

    const now = new Date();
    const salesDt = now.toISOString().slice(0, 10).replace(/-/g, "");

    const payload = {
      tin: creds.tin,
      bhfId: creds.bhfId,
      cmcKey: creds.cmcKey,
      invcNo: 0,
      orgInvcNo: 0,
      cisInvcNo: transaction.mpesaReceiptNumber ?? undefined,
      salesTyCd: "N",
      rcptTyCd: "S",
      pmtTyCd: "01",
      salesSttsCd: "02",
      salesDt,
      totItemCnt: 1,
      taxblAmtA: 0,
      taxblAmtB: taxableAmt,
      taxblAmtC: 0,
      taxblAmtD: 0,
      taxRtA: 0,
      taxRtB: 16,
      taxRtC: 0,
      taxRtD: 0,
      taxAmtA: 0,
      taxAmtB: taxAmt,
      taxAmtC: 0,
      taxAmtD: 0,
      totTaxblAmt: taxableAmt,
      totTaxAmt: taxAmt,
      totAmt: amount,
      prcInclTaxAmt: amount,
      itemList: [
        {
          itemCd: "MPESA-PAY",
          itemClsCd: "5059690800",
          itemNm: "M-Pesa Payment",
          qty: 1,
          prc: amount,
          splyAmt: taxableAmt,
          taxTyCd: "B",
          taxAmt,
          totAmt: amount,
        },
      ],
    };

    logger.info({ tenantId: tenant.id }, "Submitting sales invoice to eTIMS");

    const { data } = await client.post("/selectTrnsSalesSave", payload);

    if (data?.resultCd !== "000") {
      throw new Error(
        `eTIMS invoice submission failed: ${data?.resultMsg ?? "Unknown"} (code ${data?.resultCd})`
      );
    }

    return {
      kraInvoiceNumber: String(data?.data?.invcNo ?? data?.invcNo ?? ""),
      sdcId: String(data?.data?.sdcId ?? data?.sdcId ?? ""),
      receiptSignature: String(data?.data?.rcptSign ?? data?.rcptSign ?? ""),
    };
  }
}

export const etimsService = new EtimsService();