import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  MPESA_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  MPESA_CONSUMER_KEY: z.string().optional().default(""),
  MPESA_CONSUMER_SECRET: z.string().optional().default(""),
  MPESA_PASSKEY: z.string().optional().default(""),
  MPESA_SHORTCODE: z.string().optional().default(""),
  MPESA_CALLBACK_URL: z.string().optional().default(""),
  MPESA_BASE_URL: z.string().url().default("https://sandbox.safaricom.co.ke"),

  ETIMS_TIN: z.string().optional().default(""),
  ETIMS_BHF_ID: z.string().optional().default(""),
  ETIMS_DVC_SRL_NO: z.string().optional().default(""),
  ETIMS_BASE_URL: z.string().url().default("https://etims-api-sbx.kra.go.ke/etims-api"),

  CREDENTIALS_ENCRYPTION_KEY: z.string().length(64),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),

  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z.string().default("info"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FRONTEND_URL: z.string().default("http://localhost:3001"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;