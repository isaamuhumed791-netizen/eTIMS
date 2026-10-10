import { prisma } from "./prisma.js";
import { logger } from "./logger.js";

interface CaptureInput {
  tenantId?: string | null;
  source: string;
  error: unknown;
  context?: Record<string, unknown>;
}

export async function captureError({ tenantId, source, error, context }: CaptureInput) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack ?? null : null;

  try {
    const existing = await prisma.errorEvent.findFirst({
      where: { source, message, tenantId: tenantId ?? null, resolved: false },
    });

    if (existing) {
      await prisma.errorEvent.update({
        where: { id: existing.id },
        data: { count: { increment: 1 }, lastSeenAt: new Date() },
      });
    } else {
      await prisma.errorEvent.create({
        data: {
          tenantId: tenantId ?? null,
          source,
          message,
          stack,
          context: (context ?? {}) as object,
        },
      });
    }
  } catch (err) {
    logger.error({ err, source, message }, "Failed to capture error event");
  }
}