"use client";

import Image from "next/image";
import { Download, Loader2, FileSignature } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CertificateData } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { CertificateSecondPage } from "@/components/certificate-second-page";

interface CertificatePreviewProps {
  data: CertificateData | null;
  isLoading: boolean;
}

const iadcLogo = PlaceHolderImages.find((img) => img.id === "iadc-logo");

const CertificateField = ({ label, value, hrWidthClass = "w-full" }: { label: string; value: string | undefined; hrWidthClass?: string }) => {
  return (
    <div className="pb-6">
      <p className="text-lg font-semibold text-card-foreground">{value || ""}</p>
      <hr className={`mt-1 border-b-1 border-gray-400 ${hrWidthClass}`} />
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
};

const CertificateDateField = ({ label, value }: { label: string; value: Date | undefined }) => {
  if (!value) return null;
  const formattedDate = value.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  return <CertificateField label={label} value={formattedDate} />;
};

export function CertificatePreview({ data, isLoading }: CertificatePreviewProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Preload images to avoid CORS issues
  useEffect(() => {
    if (iadcLogo?.imageUrl) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = iadcLogo.imageUrl;
    }
  }, []);

  const handleDownloadPdf = async () => {
    const certificateElement = document.getElementById("certificate-to-print");
    const secondPageElement = document.getElementById("certificate-page-2");
    if (!certificateElement || !secondPageElement || !data || isGeneratingPdf) return;

    setIsGeneratingPdf(true);

    try {
      // Preload the logo image to ensure it's available
      if (iadcLogo?.imageUrl) {
        await new Promise((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(true);
          img.onerror = () => reject(new Error(`Failed to load image: ${iadcLogo.imageUrl}`));
          img.src = iadcLogo.imageUrl.startsWith("/") ? window.location.origin + iadcLogo.imageUrl : iadcLogo.imageUrl;
        });
      }

      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Temporarily add a class to ensure styles are applied for PDF generation
      document.body.classList.add("print-styles-active");

      // Process Page 1
      certificateElement.classList.add("preparing-pdf");
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas1 = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        onclone: async (clonedDoc) => {
          const images = clonedDoc.querySelectorAll("img");
          const imagePromises = Array.from(images).map((img) => {
            return new Promise((resolve) => {
              if (img.src.startsWith("/")) {
                img.src = window.location.origin + img.src;
              }
              img.crossOrigin = "anonymous";
              if (img.complete) {
                resolve(true);
              } else {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
              }
            });
          });
          await Promise.all(imagePromises);
        },
      });

      certificateElement.classList.remove("preparing-pdf");
      const imgData1 = canvas1.toDataURL("image/png");
      pdf.addImage(imgData1, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Process Page 2
      secondPageElement.classList.add("preparing-pdf");
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas2 = await html2canvas(secondPageElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        onclone: async (clonedDoc) => {
          const images = clonedDoc.querySelectorAll("img");
          const imagePromises = Array.from(images).map((img) => {
            return new Promise((resolve) => {
              if (img.src.startsWith("/")) {
                img.src = window.location.origin + img.src;
              }
              img.crossOrigin = "anonymous";
              if (img.complete) {
                resolve(true);
              } else {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
              }
            });
          });
          await Promise.all(imagePromises);
        },
      });

      // Clean up the classes
      document.body.classList.remove("print-styles-active");
      secondPageElement.classList.remove("preparing-pdf");

      const imgData2 = canvas2.toDataURL("image/png");
      pdf.addPage();
      pdf.addImage(imgData2, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save(`certificate-${data.idNumber}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="flex min-h-[700px] flex-col items-center justify-center gap-4 bg-card shadow-lg transition-all lg:min-h-[842px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-headline text-lg text-muted-foreground">Generating Certificate...</p>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="flex min-h-[700px] flex-col items-center justify-center gap-4 bg-card shadow-lg transition-all lg:min-h-[842px]">
        <FileSignature className="h-16 w-16 text-muted-foreground/50" />
        <p className="max-w-xs text-center font-headline text-lg text-muted-foreground">Fill out the form to see a live preview of your certificate.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page 1 - Main Certificate */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-700">Certificate - Page 1</h3>
        <div id="certificate-to-print" className="bg-card shadow-2xl w-full aspect-[1/1.414] overflow-hidden">
          <div className="relative flex h-full flex-col">
            <header className="relative w-full h-32">
              <div className="absolute inset-0 w-full h-full">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <polygon className="fill-primary" points="0,0 100,0 100,85 0,100" />
                  <polygon className="fill-white/20" points="0,100 100,40 100,100" />
                </svg>
              </div>
            </header>

            <main className="px-12 pt-8 pb-8 flex-1">
              <div className="flex flex-col items-center gap-4 mb-3">
                <div className="flex justify-start w-full">
                  {iadcLogo && (
                    <>
                      {/* Next.js Image for preview */}
                      <Image
                        src={iadcLogo.imageUrl}
                        alt={iadcLogo.description}
                        data-ai-hint={iadcLogo.imageHint}
                        width={300}
                        height={100}
                        className="pdf-hide"
                      />
                      {/* Regular img for PDF generation */}
                      <img src={iadcLogo.imageUrl} alt={iadcLogo.description} width={300} height={100} className="pdf-show hidden" crossOrigin="anonymous" />
                    </>
                  )}
                </div>
                {/* <h1 className="text-xl font-bold text-gray-700 dark:text-gray-300">IADC WELLSHARP</h1> */}
                <p className="text-lg text-muted-foreground">IADC Well Control Accreditation Program</p>
              </div>

              <div className="text-center">
                <h2 className="text-4xl text-primary mb-2">Certificate of Completion</h2>
                <p className="text-sm text-muted-foreground max-w-lg mb-8 mx-auto text-center">
                  The individual below has successfully completed a well control course at an institution accredited by the International Association of
                  Drilling Contractors.
                </p>
              </div>

              <div className="text-center my-5">
                <p className="text-2xl font-bold text-card-foreground">{data.traineeName}</p>
                <p className="text-xs text-muted-foreground">Trainee Name</p>
                <hr className="mt-1 border-b-gray-300 max-w-xs mx-auto" />
              </div>

              <div className="space-y-6 text-sm">
                <CertificateField label="Course Name" value={data.courseName} />
                {<CertificateField label="Supplement Name" value={data.supplementName || ""} />}

                <div className="grid grid-cols-2 gap-x-12 pt-4">
                  <CertificateDateField label="Completion Date" value={data.completionDate} />
                  <CertificateDateField label="Expiration Date" value={data.expirationDate} />
                  <CertificateField label="Training Provider" value={data.trainingProvider} />
                  <CertificateField label="ID Number" value={data.idNumber} />
                  <CertificateField label="Telephone Number" value={data.telephone} />
                </div>

                <div>
                  <CertificateField label="Instructor Name" value={data.instructorName} hrWidthClass={"w-[370px]"} />
                </div>
              </div>
            </main>

            <footer className="px-12 py-4 mt-auto">
              <div className="flex justify-between items-end">
                <div>{data.qrCodeDataUri && <Image src={data.qrCodeDataUri} alt="Certificate Verification QR Code" width={80} height={80} />}</div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Certificate Number: <span className="font-mono">{data.idNumber}</span>
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Page 2 - Course Completion Card */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-700">Certificate - Page 2</h3>
        <div className="shadow-2xl">
          <CertificateSecondPage data={data} />
        </div>
      </div>

      <div id="download-button" className="mt-8 flex justify-center">
        <Button size="lg" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
          {isGeneratingPdf ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              Download PDF (2 Pages)
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
