/**
 * ይሄ helper function Maps a service name to a clean, single-letter queue token prefix.
 * Example: "Teller Services" -> "A", "Forex / FX" -> "F"
 */
export function getServicePrefix(serviceName: string): string {
    const normalized = (serviceName || "").toLowerCase();

    if (normalized.includes("teller")) return "A";
    if (normalized.includes("forex") || normalized.includes("fx")) return "F";
    if (normalized.includes("account")) return "O";
    if (normalized.includes("atm") || normalized.includes("cdm")) return "C";
    if (normalized.includes("vip")) return "V";
    if (normalized.includes("loan") || normalized.includes("credit")) return "L";

    return "T";
}

/**
 * Formats a sequence number into a standard bank queue ticket string.
 * Example: prefix "A", sequence 24 -> "A024"
 */
export function formatTicketNumber(prefix: string, sequence: number): string {
    const cleanPrefix = (prefix || "T").toUpperCase();
    const paddedNumber = String(sequence).padStart(3, "0");
    return `${cleanPrefix}${paddedNumber}`;
}
