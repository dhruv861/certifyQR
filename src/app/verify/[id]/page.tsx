'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { CertificatePreview } from '@/components/certificate-preview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import type { CertificateData, Certificate } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';

export default function VerifyPage() {
  const params = useParams();
  const { firestore } = useFirebase();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!firestore || !id) {
      setIsLoading(false);
      setError("Invalid request.");
      return;
    };

    const certRef = doc(firestore, 'iadc_certificates', id);

    const unsubscribe = onSnapshot(certRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Certificate;
          // Convert date strings from Firestore to Date objects
          setCertificate({
            ...data,
            completionDate: new Date(data.completionDate),
            expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
          });
          setError(null);
        } else {
          setError(`The certificate ID "${id}" is not valid or could not be found.`);
          setCertificate(null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching certificate: ", err);
        setError('An error occurred while trying to verify the certificate. You may not have permission to view it.');
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [firestore, id]);

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-primary">
            Certificate Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="font-headline text-lg text-muted-foreground">
                Verifying Certificate...
              </p>
            </div>
          ) : certificate ? (
            <div className="space-y-6">
              <Alert variant="default" className="bg-green-100 dark:bg-green-900 border-green-500">
                <ShieldCheck className="h-4 w-4 text-green-700 dark:text-green-300" />
                <AlertTitle className="text-green-800 dark:text-green-200">Certificate Verified</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  This certificate is valid. The details below match our records.
                </AlertDescription>
              </Alert>
              <CertificatePreview data={certificate} isLoading={false} />
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Certificate Not Found or Error</AlertTitle>
                <AlertDescription>
                  {error || `The certificate ID "${id}" is not valid or could not be found in our records.`}
                </AlertDescription>
              </Alert>
               <p className="text-muted-foreground">
                Please check the ID or generate a new certificate.
              </p>
               <Button asChild>
                <Link href="/">Generate a New Certificate</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
