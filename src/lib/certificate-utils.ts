// Certificate utility functions for number generation and validation

/**
 * Certificate number generation strategies
 */
export type CertificateNumberStrategy = "timestamp" | "sequential" | "hash-based";

/**
 * Configuration for certificate number generation
 */
export interface CertificateNumberConfig {
  strategy: CertificateNumberStrategy;
  prefix?: string;
  includeChecksum?: boolean;
}

/**
 * Default configuration for certificate numbers
 */
export const DEFAULT_CERT_CONFIG: CertificateNumberConfig = {
  strategy: "timestamp",
  prefix: "",
  includeChecksum: false,
};

/**
 * Generate certificate number based on timestamp (alphanumeric approach)
 * Format: YYMMDDHH-MMSSXX (alphanumeric with random suffix)
 * Example: 25N20K14-30L2F9
 *
 * Benefits:
 * - Chronologically sortable
 * - Alphanumeric format (mix of numbers and letters)
 * - Highly unlikely to have duplicates
 * - Consistent format but more professional looking
 */
export function generateTimestampCertificateNumber(): string {
  const now = new Date();

  // Convert numbers to base36 (0-9, A-Z) for alphanumeric look
  const year = (now.getFullYear() % 100).toString(); // Last 2 digits of year
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate(); // 1-31
  const hours = now.getHours(); // 0-23
  const minutes = now.getMinutes(); // 0-59
  const seconds = now.getSeconds(); // 0-59

  // Convert to base36 and pad appropriately
  const yearPart = year;
  const monthPart = month.toString(36).toUpperCase().padStart(1, "0");
  const dayPart = day.toString(36).toUpperCase().padStart(2, "0");
  const hourPart = hours.toString(36).toUpperCase().padStart(2, "0");

  const minutePart = minutes.toString(36).toUpperCase().padStart(2, "0");
  const secondPart = seconds.toString(36).toUpperCase().padStart(2, "0");

  // Add random alphanumeric suffix for extra uniqueness
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomSuffix = Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

  const part1 = `${yearPart}${monthPart}${dayPart}${hourPart}`;
  const part2 = `${minutePart}${secondPart}${randomSuffix}`;

  return `${part1}-${part2}`;
}

/**
 * Generate certificate number with IADC prefix and year
 * Format: IADC-YYYY-NNNN
 * Example: IADC-2025-0001
 *
 * Note: Requires external counter management for sequential numbering
 */
export function generateSequentialCertificateNumber(counter: number, year?: number): string {
  const currentYear = year || new Date().getFullYear();
  const paddedCounter = counter.toString().padStart(4, "0");
  return `IADC-${currentYear}-${paddedCounter}`;
}

/**
 * Generate certificate number with enhanced uniqueness
 * Uses input data, timestamp, and randomness for collision resistance
 */
export function generateHashBasedCertificateNumber(inputData?: string): string {
  const timestamp = Date.now().toString();
  const randomSeed = Math.random().toString(36).substring(2, 8);
  const combinedInput = `${inputData || "cert"}-${timestamp}-${randomSeed}`;

  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < combinedInput.length; i++) {
    const char = combinedInput.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const hexHash = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
  const part1 = hexHash.substring(0, 8);
  const part2 = randomSeed.toUpperCase().padStart(6, "0");

  return `${part1}-${part2}`;
}

/**
 * Validate certificate number format
 */
export function isValidCertificateNumber(certNumber: string): boolean {
  // New alphanumeric timestamp format: YYMMDDHH-MMSSXX
  const alphanumericTimestampRegex = /^[0-9A-Z]{8}-[0-9A-Z]{6}$/;

  // Old numeric timestamp format: YYYYMMDD-HHMMSS (for backward compatibility)
  const numericTimestampRegex = /^\d{8}-\d{6}$/;

  // Sequential format: IADC-YYYY-NNNN
  const sequentialRegex = /^IADC-\d{4}-\d{4}$/;

  // Hash format: 8HEX-6ALPHANUMERIC
  const hashRegex = /^[0-9A-F]{8}-[0-9A-F]{6}$/;

  return (
    alphanumericTimestampRegex.test(certNumber) || numericTimestampRegex.test(certNumber) || sequentialRegex.test(certNumber) || hashRegex.test(certNumber)
  );
}

/**
 * Extract information from certificate number (if timestamp format)
 */
export function parseCertificateNumber(certNumber: string) {
  // Try new alphanumeric timestamp format: YYMMDDHH-MMSSXX
  const alphanumericMatch = certNumber.match(/^(\d{2})([0-9A-Z])([0-9A-Z]{2})([0-9A-Z]{2})-([0-9A-Z]{2})([0-9A-Z]{2})([0-9A-Z]{2})$/);

  if (alphanumericMatch) {
    const [, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr] = alphanumericMatch;

    // Convert from base36 back to decimal
    const year = 2000 + parseInt(yearStr); // Assume 21st century
    const month = parseInt(monthStr, 36);
    const day = parseInt(dayStr, 36);
    const hours = parseInt(hourStr, 36);
    const minutes = parseInt(minuteStr, 36);
    const seconds = parseInt(secondStr.substring(0, 2), 36); // Remove random suffix

    return {
      type: "alphanumeric-timestamp",
      year,
      month,
      day,
      hours,
      minutes,
      seconds,
      date: new Date(year, month - 1, day, hours, minutes, seconds),
    };
  }

  // Try old numeric timestamp format: YYYYMMDD-HHMMSS
  const numericTimestampMatch = certNumber.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/);

  if (numericTimestampMatch) {
    const [, year, month, day, hours, minutes, seconds] = numericTimestampMatch;
    return {
      type: "numeric-timestamp",
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      hours: parseInt(hours),
      minutes: parseInt(minutes),
      seconds: parseInt(seconds),
      date: new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds)),
    };
  }

  const sequentialMatch = certNumber.match(/^IADC-(\d{4})-(\d{4})$/);
  if (sequentialMatch) {
    const [, year, sequence] = sequentialMatch;
    return {
      type: "sequential",
      year: parseInt(year),
      sequence: parseInt(sequence),
    };
  }

  return {
    type: "unknown",
    original: certNumber,
  };
}
