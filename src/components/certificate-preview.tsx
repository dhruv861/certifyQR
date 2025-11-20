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
    const pdfPage1Element = document.getElementById("pdf-page-1");
    const pdfPage2Element = document.getElementById("pdf-page-2");
    if (!pdfPage1Element || !pdfPage2Element || !data || isGeneratingPdf) return;

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

      // A4 dimensions in pixels at 96 DPI (794x1123 px)
      const A4_WIDTH = 794;
      const A4_HEIGHT = 1123;

      // PDF dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Optimized html2canvas options for better PDF quality
      const canvasOptions = {
        scale: 1, // Reduced scale to avoid quality issues
        width: A4_WIDTH,
        height: A4_HEIGHT,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        letterRendering: true, // Better text rendering
        foreignObjectRendering: false, // Avoid SVG rendering issues
        onclone: async (clonedDoc: Document) => {
          // Ensure all images are loaded properly
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
      };

      // Apply PDF-specific classes for consistent rendering
      document.body.classList.add("pdf-generation-active");
      pdfPage1Element.classList.add("preparing-pdf");
      pdfPage2Element.classList.add("preparing-pdf");

      // Apply preparing-pdf class to all elements in the PDF containers
      const applyPdfClasses = (element: Element) => {
        element.classList.add("preparing-pdf");
        Array.from(element.children).forEach(applyPdfClasses);
      };
      applyPdfClasses(pdfPage1Element);
      applyPdfClasses(pdfPage2Element);

      // Wait for layout to stabilize and CSS to apply
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Process PDF Page 1
      console.log("Generating page 1...");
      const canvas1 = await html2canvas(pdfPage1Element, canvasOptions);
      const imgData1 = canvas1.toDataURL("image/jpeg", 0.95); // Use JPEG with high quality
      pdf.addImage(imgData1, "JPEG", 0, 0, pdfWidth, pdfHeight);

      // Process PDF Page 2
      console.log("Generating page 2...");
      const canvas2 = await html2canvas(pdfPage2Element, canvasOptions);
      const imgData2 = canvas2.toDataURL("image/jpeg", 0.95); // Use JPEG with high quality
      pdf.addPage();
      pdf.addImage(imgData2, "JPEG", 0, 0, pdfWidth, pdfHeight);

      // Clean up PDF classes
      document.body.classList.remove("pdf-generation-active");
      const removePdfClasses = (element: Element) => {
        element.classList.remove("preparing-pdf");
        Array.from(element.children).forEach(removePdfClasses);
      };
      removePdfClasses(pdfPage1Element);
      removePdfClasses(pdfPage2Element);

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
      {/* Hidden PDF-only layouts */}
      <div className="fixed -left-[2000px] -top-[2000px] opacity-0 pointer-events-none">
        {/* PDF Page 1 */}
        <div id="pdf-page-1" className="bg-white" style={{ width: "794px", height: "1123px", position: "absolute" }}>
          <div style={{ position: "relative", width: "100%", height: "100%", fontFamily: "Arial, sans-serif" }}>
            {/* Header with background */}
            <div
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "120px", background: "linear-gradient(135deg, #c41e3a 0%, #8b1538 100%)" }}
            >
              {/* SVG background shape */}
              <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "120px" }}>
                <polygon fill="#c41e3a" points="0,0 794,0 794,102 0,120" />
                <polygon fill="rgba(255,255,255,0.2)" points="0,120 794,48 794,120" />
              </svg>
            </div>

            {/* Content */}
            <div style={{ position: "absolute", top: "140px", left: "60px", right: "60px", bottom: "100px" }}>
              {/* Logo */}
              <div style={{ marginBottom: "15px" }}>
                {iadcLogo && (
                  <img
                    src={iadcLogo.imageUrl}
                    alt={iadcLogo.description}
                    style={{ width: "300px", height: "100px", objectFit: "contain" }}
                    crossOrigin="anonymous"
                  />
                )}
              </div>

              {/* Program title */}
              <div style={{ textAlign: "center", marginBottom: "15px" }}>
                <p style={{ fontSize: "18px", color: "#666", margin: "0" }}>IADC Well Control Accreditation Program</p>
              </div>

              {/* Main title */}
              <div style={{ textAlign: "center", marginBottom: "25px" }}>
                <h2 style={{ fontSize: "36px", color: "#c41e3a", margin: "0 0 10px 0", fontWeight: "bold" }}>Certificate of Completion</h2>
                <p style={{ fontSize: "14px", color: "#666", maxWidth: "500px", margin: "0 auto", lineHeight: "1.4" }}>
                  The individual below has successfully completed a well control course at an institution accredited by the International Association of
                  Drilling Contractors.
                </p>
              </div>

              {/* Trainee name */}
              <div style={{ textAlign: "center", margin: "25px 0" }}>
                <p style={{ fontSize: "24px", fontWeight: "bold", color: "#333", margin: "0 0 5px 0" }}>{data.traineeName}</p>
                <hr style={{ width: "300px", margin: "5px auto 0", border: "none", borderTop: "1px solid #ccc" }} />
                <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>Trainee Name</p>
              </div>

              {/* Course details */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "18px", fontWeight: "bold", color: "#333", margin: "0 0 5px 0" }}>{data.courseName}</p>
                  <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "5px 0" }} />
                  <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>Course Name</p>
                </div>

                {data.supplementName && (
                  <div style={{ marginBottom: "20px" }}>
                    <p style={{ fontSize: "18px", fontWeight: "bold", color: "#333", margin: "0 0 5px 0" }}>{data.supplementName}</p>
                    <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "5px 0" }} />
                    <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>Supplement Name</p>
                  </div>
                )}
              </div>

              {/* Grid layout for other fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
                <div>
                  <p style={{ fontSize: "18px", fontWeight: "bold", color: "#333", margin: "0 0 5px 0" }}>
                    {data.completionDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                  <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "5px 0" }} />
                  <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>Completion Date</p>
                </div>
                <div>
                  <p style={{ fontSize: "18px", fontWeight: "bold", color: "#333", margin: "0 0 5px 0" }}>
                    {data.expirationDate ? data.expirationDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : ""}
                  </p>
                  <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "5px 0" }} />
                  <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>Expiration Date</p>
                </div>
                <div>
                  <p style={{ fontSize: "18px", fontWeight: "bold", color: "#333", margin: "0 0 5px 0" }}>{data.trainingProvider}</p>
                  <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "5px 0" }} />
                  <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>Training Provider</p>
                </div>
                <div>
                  <p style={{ fontSize: "18px", fontWeight: "bold", color: "#333", margin: "0 0 5px 0" }}>{data.idNumber}</p>
                  <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "5px 0" }} />
                  <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>ID Number</p>
                </div>
                <div>
                  <p style={{ fontSize: "18px", fontWeight: "bold", color: "#333", margin: "0 0 5px 0" }}>{data.telephone || ""}</p>
                  <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "5px 0" }} />
                  <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>Telephone Number</p>
                </div>
              </div>

              {/* Instructor name (full width) */}
              <div style={{ marginTop: "20px" }}>
                <p style={{ fontSize: "18px", fontWeight: "bold", color: "#333", margin: "0 0 5px 0" }}>{data.instructorName}</p>
                <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "5px 0", maxWidth: "370px" }} />
                <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>Instructor Name</p>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "60px",
                right: "60px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div>{data.qrCodeDataUri && <img src={data.qrCodeDataUri} alt="QR Code" style={{ width: "80px", height: "80px" }} />}</div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "12px", color: "#666", margin: "0" }}>
                  Certificate Number: <span style={{ fontFamily: "monospace" }}>{data.idNumber}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Page 2 - Use CertificateSecondPage component directly */}
        <div id="pdf-page-2" className="bg-white" style={{ width: "794px", height: "1123px", position: "absolute", top: "1150px" }}>
          <div style={{ transform: "scale(1)", transformOrigin: "top left", width: "794px", height: "1123px" }}>
            <CertificateSecondPage data={data} />
          </div>
        </div>
      </div>

      {/* Page 1 - Main Certificate */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-700">Certificate - Page 1</h3>
        <div id="certificate-to-print" className="bg-card shadow-2xl w-full aspect-[1/1.414] overflow-hidden pdf-certificate-container">
          <div className="relative flex h-full flex-col pdf-certificate-content">
            <header className="relative w-full h-32 pdf-header">
              <div className="absolute inset-0 w-full h-full">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <polygon className="fill-primary" points="0,0 100,0 100,85 0,100" />
                  <polygon className="fill-white/20" points="0,100 100,40 100,100" />
                </svg>
              </div>
            </header>

            <main className="px-12 pt-8 pb-8 flex-1 pdf-main-content">
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
