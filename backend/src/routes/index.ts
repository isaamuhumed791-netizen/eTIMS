import type { FastifyPluginAsync } from "fastify";
import { authRoutes } from "./auth.routes.js";
import { tenantRoutes } from "./tenant.routes.js";
import { invoiceRoutes } from "./invoice.routes.js";
import { mpesaRoutes } from "./mpesa.routes.js";

export const registerRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authRoutes,    { prefix: "/api/v1/auth" });
  await fastify.register(tenantRoutes,  { prefix: "/api/v1/tenant" });
  await fastify.register(invoiceRoutes, { prefix: "/api/v1/invoices" });
  await fastify.register(mpesaRoutes,   { prefix: "/api/v1/mpesa" });
};