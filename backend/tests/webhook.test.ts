import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import { registerRoutes } from "../src/routes/index.js";

vi.mock("../src/lib/prisma.js", () => ({
  prisma: {
    transaction: { upsert: vi.fn().mockResolvedValue({ id: "txn-123", checkoutRequestId: "ws_CO_123", status: "SUCCESS" }) },
    invoice: { upsert: vi.fn().mockResolvedValue({ id: "inv-1" }) },
  },
}));

const addMock = vi.fn().mockResolvedValue({ id: "job-1" });
vi.mock("../src/queues/etims.queue.js", () => ({
  etimsQueue: { add: addMock },
  ETIMS_QUEUE_NAME: "etims-invoice-queue",
}));

vi.mock("../src/services/mpesa.service.js", () => ({
  mpesaService: { stkPush: vi.fn().mockResolvedValue({ CheckoutRequestID: "ws_CO_123" }) },
}));

describe("M-Pesa webhook ingestion", () => {
  let app: FastifyInstance;
  beforeAll(async () => { app = Fastify(); await app.register(registerRoutes); await app.ready(); });
  afterAll(async () => { await app.close(); });

  it("returns 200 Accepted and enqueues eTIMS job on success", async () => {
    const payload = { Body: { stkCallback: {
      MerchantRequestID: "merchant-1", CheckoutRequestID: "ws_CO_123",
      ResultCode: 0, ResultDesc: "ok",
      CallbackMetadata: { Item: [
        { Name: "Amount", Value: 100 },
        { Name: "MpesaReceiptNumber", Value: "QK12ABC34" },
        { Name: "TransactionDate", Value: 20250101120000 },
        { Name: "PhoneNumber", Value: 254712345678 },
      ]},
    }}};
    const res = await app.inject({ method: "POST", url: "/api/v1/mpesa/callback", payload });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ResultCode: 0, ResultDesc: "Accepted" });
    expect(addMock).toHaveBeenCalledTimes(1);
  });

  it("still returns 200 for failed payment", async () => {
    const payload = { Body: { stkCallback: {
      MerchantRequestID: "m2", CheckoutRequestID: "ws_CO_FAIL",
      ResultCode: 1032, ResultDesc: "cancelled",
    }}};
    const res = await app.inject({ method: "POST", url: "/api/v1/mpesa/callback", payload });
    expect(res.statusCode).toBe(200);
  });

  it("handles malformed payloads", async () => {
    const res = await app.inject({ method: "POST", url: "/api/v1/mpesa/callback", payload: { foo: "bar" } });
    expect(res.statusCode).toBe(200);
  });
});