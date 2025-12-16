export function detectLocale(): string {
  if (typeof navigator !== "undefined") {
    return navigator.languages?.[0] || navigator.language || "en-US";
  }
  return "en-US";
}

const DEFAULT_CURRENCY = "USD";

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: "USD",
  ID: "IDR",
  GB: "GBP",
  CA: "CAD",
  AU: "AUD",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  JP: "JPY",
  CN: "CNY",
  HK: "HKD",
  SG: "SGD",
  IN: "INR",
  BR: "BRL",
  RU: "RUB",
  SA: "SAR",
  AE: "AED",
  ZA: "ZAR",
  MX: "MXN",
  KR: "KRW",
  TH: "THB",
  MY: "MYR",
  PH: "PHP",
  TR: "TRY",
  CH: "CHF",
  NG: "NGN",
  KE: "KES",
  AR: "ARS",
  CL: "CLP",
  CO: "COP",
  PE: "PEN",
  PK: "PKR",
  BD: "BDT",
  EG: "EGP",
  NZ: "NZD",
};

export function getCurrency(): string {
  if (typeof localStorage !== "undefined") {
    const override = localStorage.getItem("user-currency");
    if (override) return override;
  }
  const locale = detectLocale();
  const parts = locale.split("-");
  const country = parts[1]?.toUpperCase();
  if (country && COUNTRY_TO_CURRENCY[country]) return COUNTRY_TO_CURRENCY[country];
  return DEFAULT_CURRENCY;
}

export function setUserCurrency(code: string) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("user-currency", code);
  }
}

export function formatCurrency(amount: number | string, currency?: string, locale?: string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "-";
  const cur = currency || getCurrency();
  const loc = locale || detectLocale();
  try {
    return new Intl.NumberFormat(loc, { style: "currency", currency: cur }).format(num);
  } catch {
    return `${cur} ${num.toFixed(2)}`;
  }
}

export function getCurrencySymbol(currency?: string, locale?: string): string {
  const cur = currency || getCurrency();
  const loc = locale || detectLocale();
  try {
    const parts = new Intl.NumberFormat(loc, { style: "currency", currency: cur }).formatToParts(1);
    const sym = parts.find((p) => p.type === "currency")?.value;
    return sym || cur;
  } catch {
    return cur;
  }
}