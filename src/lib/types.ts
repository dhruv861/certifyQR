import { z } from 'zod';

const formSchema = z.object({
  traineeName: z.string().min(2, "Name must be at least 2 characters."),
  courseName: z.string().min(3, "Course name must be at least 3 characters."),
  supplementName: z.string().optional(),
  completionDate: z.date(),
  expirationDate: z.date().optional(),
  trainingProvider: z.string().min(2, "Training provider is required."),
  telephone: z.string().optional(),
  instructorName: z.string().min(2, "Instructor name is required."),
});

export type FormValues = z.infer<typeof formSchema>;

export type Certificate = {
  id: string;
  traineeName: string;
  courseName: string;
  supplementName?: string;
  completionDate: string; // Stored as ISO string
  expirationDate?: string; // Stored as ISO string
  trainingProvider: string;
  instructorName: string;
  telephone?: string;
  qrCodeDataUri: string;
};

// This is the type used on the client-side, with Date objects
export type CertificateData = Omit<Certificate, 'completionDate' | 'expirationDate'> & {
  completionDate: Date;
  expirationDate?: Date;
}


export type ActionResult =
  | { success: true; data: Certificate }
  | { success: false; error: string };
