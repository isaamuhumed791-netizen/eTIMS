"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export interface SupportSettings {
  email: string;
  whatsapp: string;
  phoneDisplay: string;
  hours: string;
}

const FALLBACK: SupportSettings = {
  email: "support@mpesa-etims.local",
  whatsapp: "254700000000",
  phoneDisplay: "+254 700 000 000",
  hours: "Mon-Fri, 8am - 6pm EAT",
};

export function useSupportSettings() {
  const { data } = useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => (await api.get<{ support: SupportSettings }>("/public/settings")).data,
    staleTime: 60_000,
  });
  return data?.support ?? FALLBACK;
}

export function mailtoSupport(email: string, subject = "Support request") {
  const params = new URLSearchParams({ view: "cm", fs: "1", to: email, su: subject });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function whatsappSupport(whatsapp: string, message = "Hi, I need help with my eTIMS integration") {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
}