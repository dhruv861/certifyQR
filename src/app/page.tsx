'use client';

import { useState } from 'react';
import type { CertificateData, FormValues } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateCertificateAction } from '@/lib/actions';
import { QrCertForm } from '@/components/qr-cert-form';
import { CertificatePreview } from '@/components/certificate-preview';
import { Award, List } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


const iadcLogo = PlaceHolderImages.find((img) => img.id === 'iadc-logo');

export default function Home() {
  const [certificateData, setCertificateData] = useState<CertificateData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const handleGenerateCertificate = async (data: FormValues) => {
    setIsLoading(true);
    setCertificateData(null);

    if (!firestore) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore is not initialized. Please try again later.',
      });
      setIsLoading(false);
      return;
    }

    try {
      // 1. Server action generates data but does not write to DB
      const result = await generateCertificateAction(data);

      if (result.success && result.data) {
        // 2. Client receives data and writes to Firestore
        const newCertificate = result.data;
        const certRef = doc(firestore, 'iadc_certificates', newCertificate.id);
        
        // Using client-side setDoc
        setDoc(certRef, newCertificate).catch(async (serverError) => {
           const permissionError = new FirestorePermissionError({
              path: certRef.path,
              operation: 'create',
              requestResourceData: newCertificate,
           });
           errorEmitter.emit('permission-error', permissionError);
           // Also show a toast to the user
           toast({
             variant: 'destructive',
             title: 'Permission Denied',
             description: 'You do not have permission to save the certificate.',
           });
        });

        // 3. Update UI optimistically
        const clientData: CertificateData = {
          ...newCertificate,
          completionDate: new Date(newCertificate.completionDate),
          expirationDate: newCertificate.expirationDate
            ? new Date(newCertificate.expirationDate)
            : undefined,
        };
        setCertificateData(clientData);

        toast({
          title: 'Success!',
          description: 'Your certificate has been generated and saved.',
          className: 'bg-green-100 dark:bg-green-900',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Generating Certificate',
          description:
            result.error || 'An unexpected error occurred. Please try again.',
        });
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }


    setIsLoading(false);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-4">
           {iadcLogo && <Image src={iadcLogo.imageUrl} alt={iadcLogo.description} width={50} height={50} data-ai-hint={iadcLogo.imageHint} />}
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
            IADC WELLSHARP
          </h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          IADC Well Control Accreditation Program
        </p>
      </header>

      <div className="mb-8 flex justify-end gap-4">
        <Button asChild variant="outline">
          <Link href="/search">
            <Award className="mr-2 h-4 w-4" />
            Verify Certificate
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/certificates">
            <List className="mr-2 h-4 w-4" />
            View All Certificates
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <QrCertForm
            onGenerate={handleGenerateCertificate}
            isGenerating={isLoading}
          />
        </div>
        <div className="lg:col-span-3">
          <CertificatePreview data={certificateData} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
}
