import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma.js";

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error("Usage: reset-password.ts <email> <newpassword>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const user = await prisma.user.update({
  where: { email },
  data: { passwordHash: hash },
});
console.log(`OK: password updated for ${user.email}`);
process.exit(0);