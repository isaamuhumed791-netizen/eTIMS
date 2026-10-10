import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { requireAdmin } from "../../lib/admin.middleware.js";
import { SETTING_KEYS, getSettings, setSetting } from "../../lib/settings.js";
import { audit } from "../../lib/audit.js";

const updateSchema = z.object({
  values: z.record(z.string(), z.string()),
});

export const adminSettingsRoutes: FastifyPluginAsync = async (fastify) => {
  // -------- Get all settings --------
  fastify.get("/", { preHandler: requireAdmin }, async (_request, reply) => {
    const allKeys = Object.values(SETTING_KEYS);
    const values = await getSettings(allKeys);
    return reply.send({ keys: allKeys, values });
  });

  // -------- Update settings (bulk) --------
  fastify.put("/", { preHandler: requireAdmin }, async (request, reply) => {
    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Validation failed" });

    const allowed = new Set<string>(Object.values(SETTING_KEYS));
    const admin = request.admin!;

    const updated: string[] = [];
    for (const [key, value] of Object.entries(parsed.data.values)) {
      if (!allowed.has(key)) continue;
      await setSetting(key, value, admin.email);
      updated.push(key);
    }

    await audit({
      request,
      action: "settings.update",
      targetType: "SystemSetting",
      payload: { updatedKeys: updated, values: parsed.data.values },
    });

    return reply.send({ ok: true, updated });
  });
};