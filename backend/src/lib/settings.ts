import { prisma } from "./prisma.js";

export const SETTING_KEYS = {
  SUPPORT_EMAIL: "support.email",
  SUPPORT_WHATSAPP: "support.whatsapp",
  SUPPORT_PHONE_DISPLAY: "support.phoneDisplay",
  SUPPORT_HOURS: "support.hours",
  FEATURE_ETIMS_ENABLED: "feature.etims.enabled",
  FEATURE_MPESA_ENABLED: "feature.mpesa.enabled",
} as const;

export const PUBLIC_SETTING_KEYS: string[] = [
  SETTING_KEYS.SUPPORT_EMAIL,
  SETTING_KEYS.SUPPORT_WHATSAPP,
  SETTING_KEYS.SUPPORT_PHONE_DISPLAY,
  SETTING_KEYS.SUPPORT_HOURS,
];

const DEFAULTS: Record<string, string> = {
  [SETTING_KEYS.SUPPORT_EMAIL]: "support@mpesa-etims.local",
  [SETTING_KEYS.SUPPORT_WHATSAPP]: "254700000000",
  [SETTING_KEYS.SUPPORT_PHONE_DISPLAY]: "+254 700 000 000",
  [SETTING_KEYS.SUPPORT_HOURS]: "Mon-Fri, 8am - 6pm EAT",
  [SETTING_KEYS.FEATURE_ETIMS_ENABLED]: "true",
  [SETTING_KEYS.FEATURE_MPESA_ENABLED]: "true",
};

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.systemSetting.findUnique({ where: { key } });
  return row?.value ?? DEFAULTS[key] ?? "";
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await prisma.systemSetting.findMany({ where: { key: { in: keys } } });
  const map: Record<string, string> = {};
  for (const k of keys) {
    const row = rows.find((r) => r.key === k);
    map[k] = row?.value ?? DEFAULTS[k] ?? "";
  }
  return map;
}

export async function setSetting(key: string, value: string, updatedBy?: string) {
  return prisma.systemSetting.upsert({
    where: { key },
    create: { key, value, updatedBy },
    update: { value, updatedBy },
  });
}

export async function seedDefaultSettings(updatedBy = "system") {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    const existing = await prisma.systemSetting.findUnique({ where: { key } });
    if (!existing) {
      await prisma.systemSetting.create({ data: { key, value, updatedBy } });
    }
  }
}