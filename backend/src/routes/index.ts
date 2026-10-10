import type { FastifyPluginAsync } from "fastify";
import { authRoutes } from "./auth.routes.js";
import { tenantRoutes } from "./tenant.routes.js";
import { invoiceRoutes } from "./invoice.routes.js";
import { mpesaRoutes } from "./mpesa.routes.js";
import { publicRoutes } from "./public.routes.js";
import { adminOverviewRoutes } from "./admin/overview.routes.js";
import { adminTenantsRoutes } from "./admin/tenants.routes.js";
import { adminSettingsRoutes } from "./admin/settings.routes.js";
import { adminErrorsRoutes } from "./admin/errors.routes.js";
import { adminAuditRoutes } from "./admin/audit.routes.js";
import { adminQueueRoutes } from "./admin/queue.routes.js";

export const registerRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(publicRoutes,      { prefix: "/api/v1/public" });
  await fastify.register(authRoutes,        { prefix: "/api/v1/auth" });
  await fastify.register(tenantRoutes,      { prefix: "/api/v1/tenant" });
  await fastify.register(invoiceRoutes,     { prefix: "/api/v1/invoices" });
  await fastify.register(mpesaRoutes,       { prefix: "/api/v1/mpesa" });

  // Admin (protected by requireAdmin on each route)
  await fastify.register(adminOverviewRoutes, { prefix: "/api/v1/admin" });
  await fastify.register(adminTenantsRoutes,  { prefix: "/api/v1/admin/tenants" });
  await fastify.register(adminSettingsRoutes, { prefix: "/api/v1/admin/settings" });
  await fastify.register(adminErrorsRoutes,   { prefix: "/api/v1/admin/errors" });
  await fastify.register(adminAuditRoutes,    { prefix: "/api/v1/admin/audit" });
  await fastify.register(adminQueueRoutes,    { prefix: "/api/v1/admin/queue" });
};