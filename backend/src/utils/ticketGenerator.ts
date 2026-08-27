/**
 * Maps a specific banking service name to a clean, single-letter queue token prefix.
 * Example: "Account Opening" -> "A", "Cash Services" -> "C", "ATM Card Request" -> "M"
 */
export function getServicePrefix(serviceName: string): string {
  const normalized = (serviceName || "").toLowerCase();

  if (normalized.includes("account") || normalized.includes("opening")) return "A";
  if (normalized.includes("atm") || normalized.includes("card")) return "M";
  if (normalized.includes("cash") || normalized.includes("deposit") || normalized.includes("withdraw") || normalized.includes("teller")) return "C";
  if (normalized.includes("loan") || normalized.includes("credit") || normalized.includes("finance")) return "L";
  if (normalized.includes("forex") || normalized.includes("fx") || normalized.includes("currency") || normalized.includes("remittance")) return "F";
  if (normalized.includes("digital") || normalized.includes("mobile") || normalized.includes("app")) return "D";
  if (normalized.includes("vip")) return "V";
  if (normalized.includes("support") || normalized.includes("service")) return "S";

  return "T";
}

/**
 * Formats a sequence number into a standard bank queue ticket string.
 * Example: prefix "A", sequence 24 -> "A024" or "A-024"
 */
export function formatTicketNumber(prefix: string, sequence: number): string {
  const cleanPrefix = (prefix || "T").toUpperCase();
  const paddedNumber = String(sequence).padStart(3, "0");
  return `${cleanPrefix}${paddedNumber}`;
}
