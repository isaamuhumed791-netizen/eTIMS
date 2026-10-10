/**
 * Promote / demote admins with audit trail.
 *   pnpm admin:list
 *   pnpm admin:promote user@example.com
 *   pnpm admin:demote  user@example.com
 */
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const [cmd, email] = process.argv.slice(2);

  if (cmd === "list") {
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPERADMIN"] } },
      select: { id: true, email: true, fullName: true, role: true },
    });
    if (!admins.length) {
      console.log("No admins yet.");
    } else {
      console.log("Current admins:");
      for (const a of admins) {
        console.log(`  ${a.role.padEnd(10)} ${a.email}  (${a.fullName})`);
      }
    }
    return;
  }

  if (!["promote", "demote"].includes(cmd) || !email) {
    console.error("Usage: promote-admin.ts promote|demote|list <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user with email ${email}`);
    process.exit(1);
  }

  const newRole = cmd === "promote" ? "ADMIN" : "OWNER";
  const previousRole = user.role;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { role: newRole } });
    await tx.auditLog.create({
      data: {
        actorId: null,
        actorEmail: "cli@system",
        action: cmd === "promote" ? "admin.promote" : "admin.demote",
        targetType: "User",
        targetId: user.id,
        payload: { email, previousRole, newRole },
        ipAddress: "cli",
      },
    });
  });

  console.log(`OK: ${email} is now ${newRole} (was ${previousRole})`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });