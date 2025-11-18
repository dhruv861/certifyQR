'use server';

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { headers } from 'next/headers';
import type { Certificate, FormValues, ActionResult } from '@/lib/types';
// NOTE: No longer importing server-side firebase

const formSchema = z.object({
  traineeName: z.string().min(2, 'Name must be at least 2 characters.'),
  courseName: z.string().min(3, 'Course name must be at least 3 characters.'),
  supplementName: z.string().optional(),
  completionDate: z.date(),
  expirationDate: z.date().optional(),
  trainingProvider: z.string().min(2, 'Training provider is required.'),
  telephone: z.string().optional(),
  instructorName: z.string().min(2, 'Instructor name is required.'),
});

export async function generateCertificateAction(
  formData: FormValues
): Promise<ActionResult> {
  try {
    const validatedData = formSchema.parse(formData);
    
    // This action no longer writes to Firestore.
    // It only generates the ID and QR code and returns the data.
    
    const id = `CERT-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;

    const headersList = headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const verificationUrl = `${baseUrl}/verify/${id}`;
    const qrCodeDataUri = await QRCode.toDataURL(verificationUrl);
    
    if (!qrCodeDataUri || !qrCodeDataUri.startsWith('data:image/')) {
        throw new Error('QR Code generation failed.');
    }
    
    const certificateData: Certificate = {
      ...validatedData,
      completionDate: validatedData.completionDate.toISOString(),
      expirationDate: validatedData.expirationDate?.toISOString(),
      id,
      qrCodeDataUri,
    };
    
    // No longer writing to firestore here.
    // await certificateRef.set(certificateData);

    return { success: true, data: certificateData };

  } catch (error) {
    console.error('[SERVER ACTION ERROR]', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid form data provided.' };
    }
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}
