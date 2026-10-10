import bcrypt from "bcrypt";
import { prisma } from "./prisma.js";
import { logger } from "./logger.js";
import { env } from "./env.js";

export async function bootstrapAdminIfNeeded() {
  const existing = await prisma.user.findFirst({
    where: { role: { in: ["ADMIN", "SUPERADMIN"] } },
    select: { id: true, email: true },
  });

  if (existing) {
    logger.info({ adminEmail: existing.email }, "Admin already exists — bootstrap skipped");
    return { created: false, adminEmail: existing.email };
  }

  const email = env.ADMIN_BOOTSTRAP_EMAIL;
  const password = env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!email || !password) {
    logger.warn(
      "No admin exists and ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD not set — " +
      "set them in .env and restart, or run: pnpm admin:promote <email>"
    );
    return { created: false };
  }

  if (password.length < 8) {
    logger.error("ADMIN_BOOTSTRAP_PASSWORD must be at least 8 characters");
    throw new Error("ADMIN_BOOTSTRAP_PASSWORD too short");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Create a default tenant for the admin (so the admin also has a normal dashboard)
  const slug = "admin-" + Math.random().toString(36).slice(2, 8);

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: "Admin HQ",
        slug,
        email,
        plan: "FOUNDING",
      },
    });
    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email,
        passwordHash,
        fullName: "Admin",
        role: "ADMIN",
      },
    });
    return { tenant, user };
  });

  logger.info(
    {
      email: result.user.email,
      tenantSlug: result.tenant.slug,
    },
    "Bootstrap admin created — REMOVE ADMIN_BOOTSTRAP_* from .env now"
  );

  return { created: true, adminEmail: result.user.email };
}