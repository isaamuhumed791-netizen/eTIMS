-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "billingCustomerId" TEXT,
ADD COLUMN     "billingProvider" TEXT,
ADD COLUMN     "billingSubscriptionId" TEXT,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'FOUNDING',
ADD COLUMN     "planExpiresAt" TIMESTAMP(3);
