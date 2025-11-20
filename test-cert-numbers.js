// Quick test of the new alphanumeric certificate number generation
import { generateTimestampCertificateNumber, isValidCertificateNumber, parseCertificateNumber } from "./certificate-utils";

console.log("=== New Alphanumeric Certificate Number Examples ===");

// Generate multiple examples to show the format
for (let i = 0; i < 5; i++) {
  const certNum = generateTimestampCertificateNumber();
  const isValid = isValidCertificateNumber(certNum);
  const parsed = parseCertificateNumber(certNum);

  console.log(`Example ${i + 1}:`);
  console.log(`  Certificate: ${certNum}`);
  console.log(`  Valid: ${isValid}`);
  console.log(`  Type: ${parsed.type}`);
  console.log("");
}
