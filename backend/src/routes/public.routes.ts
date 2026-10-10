import type { FastifyPluginAsync } from "fastify";
import { PUBLIC_SETTING_KEYS, getSettings } from "../lib/settings.js";

export const publicRoutes: FastifyPluginAsync = async (fastify) => {
  // No auth — tenant UI reads support contacts from here.
  fastify.get("/settings", async (_request, reply) => {
    const values = await getSettings(PUBLIC_SETTING_KEYS);
    return reply.send({
      support: {
        email: values["support.email"] ?? "",
        whatsapp: values["support.whatsapp"] ?? "",
        phoneDisplay: values["support.phoneDisplay"] ?? "",
        hours: values["support.hours"] ?? "",
      },
    });
  });
};