export const SUPPORT = {
  email: "support@mpesa-etims.local",
  whatsapp: "254700000000",
  phoneDisplay: "+254 700 000 000",
  hours: "Mon-Fri, 8am - 6pm EAT",
};

export function mailtoSupport(subject = "Support request") {
  return `mailto:${SUPPORT.email}?subject=${encodeURIComponent(subject)}`;
}

export function whatsappSupport(message = "Hi, I need help setting up my eTIMS integration") {
  return `https://wa.me/${SUPPORT.whatsapp}?text=${encodeURIComponent(message)}`;
}