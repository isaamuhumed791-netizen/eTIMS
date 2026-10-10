import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../lib/admin.middleware.js";

export const adminOverviewRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/stats", { preHandler: requireAdmin }, async (_request, reply) => {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      tenantCount,
      userCount,
      activeTenants,
      txCount,
      tx24h,
      txSuccess24h,
      invoiceCounts,
      revenueAgg,
      revenue24h,
      errorCount,
      unresolvedErrors,
      queueWaiting,
      queueActive,
      queueFailed,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.tenant.count({ where: { etimsConnectedAt: { not: null }, mpesaConnectedAt: { not: null } } }),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { createdAt: { gte: since24h } } }),
      prisma.transaction.count({ where: { createdAt: { gte: since24h }, status: "SUCCESS" } }),
      prisma.invoice.groupBy({ by: ["status"], _count: true }),
      prisma.transaction.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { status: "SUCCESS", createdAt: { gte: since24h } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.errorEvent.count(),
      prisma.errorEvent.count({ where: { resolved: false } }),
      // Real queue counts come from a separate endpoint; placeholder here
      Promise.resolve(0),
      Promise.resolve(0),
      Promise.resolve(0),
    ]);

    const invoiceMap: Record<string, number> = {};
    for (const g of invoiceCounts) invoiceMap[g.status] = g._count;

    const totalInvoices = Object.values(invoiceMap).reduce((a, b) => a + b, 0);
    const submitted = invoiceMap.SUBMITTED ?? 0;
    const successRate = totalInvoices > 0 ? +((submitted / totalInvoices) * 100).toFixed(1) : 0;

    // 7-day chart data (transactions per day)
    const sevenDayTx = await prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*)::bigint as count
      FROM "Transaction"
      WHERE "createdAt" >= ${since7d}
      GROUP BY day
      ORDER BY day ASC
    `;

    return reply.send({
      tenants: { total: tenantCount, active: activeTenants },
      users: { total: userCount },
      transactions: {
        total: txCount,
        last24h: tx24h,
        last24hSuccess: txSuccess24h,
        successTotal: revenueAgg._count,
        totalAmount: Number(revenueAgg._sum.amount ?? 0),
        amount24h: Number(revenue24h._sum.amount ?? 0),
      },
      invoices: {
        total: totalInvoices,
        submitted: invoiceMap.SUBMITTED ?? 0,
        queued: invoiceMap.QUEUED ?? 0,
        failed: invoiceMap.FAILED ?? 0,
        successRate,
      },
      errors: { total: errorCount, unresolved: unresolvedErrors },
      queue: { waiting: queueWaiting, active: queueActive, failed: queueFailed },
      chart: {
        sevenDayTransactions: sevenDayTx.map((r) => ({
          day: r.day.toISOString().slice(0, 10),
          count: Number(r.count),
        })),
      },
    });
  });
};