'use client';

import Image from 'next/image';
import {
  Download,
  Loader2,
  FileSignature,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CertificateData } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface CertificatePreviewProps {
  data: CertificateData | null;
  isLoading: boolean;
}

const iadcLogo = PlaceHolderImages.find((img) => img.id === 'iadc-logo');

const CertificateField = ({ label, value }: { label: string, value: string | undefined }) => {
  if (!value) return null;
  return (
    <div className="pb-6">
      <p className='text-lg font-semibold text-card-foreground'>{value}</p>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <hr className='mt-1 border-b-gray-300' />
    </div>
  )
}

const CertificateDateField = ({ label, value }: { label: string, value: Date | undefined }) => {
  if (!value) return null;
  const formattedDate = value.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  return <CertificateField label={label} value={formattedDate} />;
}

export function CertificatePreview({ data, isLoading }: CertificatePreviewProps) {
  
  const handleDownloadPdf = async () => {
    const certificateElement = document.getElementById('certificate-to-print');
    if (!certificateElement || !data) return;

    // Temporarily add a class to ensure styles are applied for PDF generation
    document.body.classList.add('print-styles-active');
    certificateElement.classList.add('preparing-pdf');

    const canvas = await html2canvas(certificateElement, {
      scale: 3, // Increase scale for better quality
      useCORS: true,
      backgroundColor: null, // Use transparent background
    });
    
    // Clean up the classes
    document.body.classList.remove('print-styles-active');
    certificateElement.classList.remove('preparing-pdf');

    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`certificate-${data.id}.pdf`);
  };

  if (isLoading) {
    return (
      <Card className="flex min-h-[700px] flex-col items-center justify-center gap-4 bg-card shadow-lg transition-all lg:min-h-[842px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-headline text-lg text-muted-foreground">
          Generating Certificate...
        </p>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="flex min-h-[700px] flex-col items-center justify-center gap-4 bg-card shadow-lg transition-all lg:min-h-[842px]">
        <FileSignature className="h-16 w-16 text-muted-foreground/50" />
        <p className="max-w-xs text-center font-headline text-lg text-muted-foreground">
          Fill out the form to see a live preview of your certificate.
        </p>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div id="certificate-to-print" className='bg-card shadow-2xl w-full aspect-[1/1.414] overflow-hidden'>
        <div className="relative flex h-full flex-col">
          
          <header className='relative h-[18%]'>
              <div className="absolute top-0 left-0 w-full h-full">
                <svg
                  className="w-full h-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <polygon
                    className="fill-primary"
                    points="0,0 100,0 100,85 0,100"
                  />
                  <polygon
                    className="fill-white/20"
                    points="0,100 100,40 100,100"
                  />
                </svg>
              </div>
          </header>
          
          <main className='px-12 pt-8 pb-8 flex-1'>
            <div className='flex items-center gap-4 mb-8'>
              {iadcLogo && (
                <Image
                  src={iadcLogo.imageUrl}
                  alt={iadcLogo.description}
                  data-ai-hint={iadcLogo.imageHint}
                  width={40}
                  height={40}
                />
              )}
              <div>
                <h1 className='text-xl font-bold text-gray-700 dark:text-gray-300'>IADC WELLSHARP</h1>
                <p className='text-sm text-muted-foreground'>IADC Well Control Accreditation Program</p>
              </div>
            </div>

            <h2 className='text-4xl font-bold text-primary mb-2'>Certificate of Completion</h2>
            <p className='text-sm text-muted-foreground max-w-lg mb-8'>
              The individual below has successfully completed a well control course at an
              institution accredited by the International Association of Drilling Contractors.
            </p>
            
            <div className="text-center my-10">
               <p className='text-2xl font-bold text-card-foreground'>{data.traineeName}</p>
               <p className='text-xs text-muted-foreground'>Trainee Name</p>
               <hr className='mt-1 border-b-gray-300 max-w-xs mx-auto' />
            </div>

            <div className='space-y-6 text-sm'>
              <CertificateField label="Course Name" value={data.courseName} />
              {data.supplementName && <CertificateField label="Supplement Name" value={data.supplementName} />}
              
              <div className='grid grid-cols-2 gap-x-12 pt-4'>
                <CertificateDateField label="Completion Date" value={data.completionDate} />
                <CertificateDateField label="Expiration Date" value={data.expirationDate} />
                <CertificateField label="Training Provider" value={data.trainingProvider} />
                <CertificateField label="ID Number" value={data.id.split('-')[1]} />
                <CertificateField label="Telephone Number" value={data.telephone} />
                <CertificateField label="Instructor Name" value={data.instructorName} />
              </div>
            </div>
          </main>

          <footer className='px-12 py-4 mt-auto'>
            <div className='flex justify-between items-end'>
              <div>
                {data.qrCodeDataUri && (
                  <Image
                    src={data.qrCodeDataUri}
                    alt="Certificate Verification QR Code"
                    width={80}
                    height={80}
                  />
                )}
              </div>
              <div className='text-right'>
                <p className='text-xs text-muted-foreground'>Certificate Number: <span className='font-mono'>{data.id}</span></p>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <div id="download-button" className="mt-4 flex justify-center">
        <Button size="lg" onClick={handleDownloadPdf}>
          <Download className="mr-2 h-5 w-5" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
