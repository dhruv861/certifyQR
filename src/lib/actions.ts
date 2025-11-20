"use server";

import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { headers } from "next/headers";
import type { Certificate, FormValues, ActionResult } from "@/lib/types";
import { generateCertificateNumber } from "@/lib/types";
// NOTE: No longer importing server-side firebase

const formSchema = z.object({
  idNumber: z.string().min(2, "ID Number must be at least 2 characters."),
  traineeName: z.string().min(2, "Name must be at least 2 characters."),
  courseName: z.string().min(3, "Course name must be at least 3 characters."),
  supplementName: z.string().optional(),
  completionDate: z.date(),
  expirationDate: z.date().optional(),
  trainingProvider: z.string().min(2, "Training provider is required."),
  telephone: z.string().optional(),
  instructorName: z.string().min(2, "Instructor name is required."),
});

export async function generateCertificateAction(formData: FormValues): Promise<ActionResult> {
  try {
    const validatedData = formSchema.parse(formData);

    // Generate a unique certificate number first (this will be the primary identifier)
    const certificateNumber = generateCertificateNumber();

    // Use the certificate number as the document ID in Firestore
    const id = certificateNumber;

    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // QR code now points to search page with certificate number prefilled
    const verificationUrl = `${baseUrl}/search?id=${encodeURIComponent(certificateNumber)}`;
    const qrCodeDataUri = await QRCode.toDataURL(verificationUrl);

    if (!qrCodeDataUri || !qrCodeDataUri.startsWith("data:image/")) {
      throw new Error("QR Code generation failed.");
    }

    const certificateData: Certificate = {
      ...validatedData,
      completionDate: validatedData.completionDate.toISOString(),
      expirationDate: validatedData.expirationDate?.toISOString(),
      id,
      certificateNumber,
      qrCodeDataUri,
    };

    // No longer writing to firestore here.
    // await certificateRef.set(certificateData);

    return { success: true, data: certificateData };
  } catch (error) {
    console.error("[SERVER ACTION ERROR]", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid form data provided." };
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
