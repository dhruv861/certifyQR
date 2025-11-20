// Example usage and testing of certificate number generation

import {
  generateTimestampCertificateNumber,
  generateSequentialCertificateNumber,
  generateHashBasedCertificateNumber,
  isValidCertificateNumber,
  parseCertificateNumber,
} from "./certificate-utils";

// Example outputs for different strategies:

console.log("=== Certificate Number Generation Examples ===\n");

// 1. Timestamp-based (recommended - alphanumeric and consistent)
console.log("1. Alphanumeric Timestamp-based approach:");
console.log("Format: YYMMDDHH-MMSSXX (XX = random suffix)");
console.log("Example:", generateTimestampCertificateNumber());
console.log("Benefits: Chronological, alphanumeric, unique, professional\n");

// 2. Sequential approach (requires counter management)
console.log("2. Sequential approach:");
console.log("Format: IADC-YYYY-NNNN");
console.log("Example:", generateSequentialCertificateNumber(1));
console.log("Example:", generateSequentialCertificateNumber(42));
console.log("Benefits: Professional looking, easy to track\n");

// 3. Hash-based approach (maximum uniqueness)
console.log("3. Hash-based approach:");
console.log("Format: 8HEX-6ALPHANUM");
console.log("Example:", generateHashBasedCertificateNumber("trainee-data"));
console.log("Example:", generateHashBasedCertificateNumber("different-data"));
console.log("Benefits: Highly unique, collision resistant\n");

// Validation examples
console.log("=== Validation Examples ===");
const examples = [
  "25N20K14-30L2F9", // Valid new alphanumeric timestamp
  "20251120-143022", // Valid old numeric timestamp (backward compatibility)
  "IADC-2025-0001", // Valid sequential
  "A1B2C3D4-EF5G6H", // Valid hash
  "invalid-format", // Invalid
];

examples.forEach((cert) => {
  console.log(`${cert}: ${isValidCertificateNumber(cert) ? "VALID" : "INVALID"}`);
});

// Parsing example
console.log("\n=== Parsing Example ===");
const newCert = generateTimestampCertificateNumber();
const parsed = parseCertificateNumber(newCert);
console.log("Certificate:", newCert);
console.log("Parsed info:", JSON.stringify(parsed, null, 2));
