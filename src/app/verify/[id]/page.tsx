"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Loader2, ArrowLeft, Database, TestTube } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CertificateData, Certificate } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useFirebase } from "@/firebase";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { findCertificateById } from "@/lib/find-certificate";

const iadcLogo = PlaceHolderImages.find((img) => img.id === "iadc-logo");

const VerificationField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
    <span className="text-gray-600 font-medium">{label}:</span>
    <span className="text-gray-900 font-semibold text-right">{value}</span>
  </div>
);

export default function VerifyPage() {
  const params = useParams();
  const { firestore } = useFirebase();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const searchCertificate = async () => {
      if (!firestore || !id) {
        setIsLoading(false);
        setError("Invalid request.");
        return;
      }

      try {
        const { certificate: foundCert } = await findCertificateById(firestore, id);

        if (foundCert) {
          // Convert date strings from Firestore to Date objects
          setCertificate({
            ...foundCert,
            completionDate: new Date(foundCert.completionDate),
            expirationDate: foundCert.expirationDate ? new Date(foundCert.expirationDate) : undefined,
          });
          setError(null);
        } else {
          setError(`The certificate ID "${id}" is not valid or could not be found in any collection.`);
          setCertificate(null);
        }
      } catch (err) {
        console.error("Error fetching certificate: ", err);
        setError("An error occurred while trying to verify the certificate. You may not have permission to view it.");
        setCertificate(null);
      } finally {
        setIsLoading(false);
      }
    };

    searchCertificate();
  }, [firestore, id]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatus = (expirationDate?: Date) => {
    if (!expirationDate) return "Active";
    const now = new Date();
    return expirationDate > now ? "Active" : "Expired";
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {isLoading ? (
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg text-muted-foreground">Verifying Certificate...</p>
            </CardContent>
          </Card>
        ) : certificate ? (
          <Card className="shadow-lg">
            <CardContent className="p-8">
              {/* IADC Logo */}
              <div className="flex justify-center mb-6">
                {iadcLogo && <Image src={iadcLogo.imageUrl} alt={iadcLogo.description} width={150} height={50} className="h-12 w-auto" />}
              </div>

              {/* Collection Indicator
              {foundInCollection && (
                <div className="flex justify-center mb-6">
                  <Badge 
                    variant={foundInCollection === 'iadc_certificates' ? "default" : "secondary"}
                    className={foundInCollection === 'iadc_certificates' 
                      ? "bg-blue-100 text-blue-800 border-blue-300" 
                      : "bg-orange-100 text-orange-800 border-orange-300"
                    }
                  >
                    {foundInCollection === 'iadc_certificates' ? (
                      <>
                        <Database className="h-3 w-3 mr-1" />
                        Production Certificate
                      </>
                    ) : (
                      <>
                        <TestTube className="h-3 w-3 mr-1" />
                        Test Certificate
                      </>
                    )}
                  </Badge>
                </div>
              )} */}

              {/* Certificate Details */}
              <div className="space-y-0">
                <VerificationField label="Certificate ID" value={certificate.id} />
                <VerificationField label="Name" value={certificate.traineeName} />
                <VerificationField label="Completed On" value={formatDate(certificate.completionDate)} />
                {certificate.expirationDate && <VerificationField label="Expires On" value={formatDate(certificate.expirationDate)} />}
                <VerificationField label="Program" value={certificate.courseName + (certificate.supplementName ? `, ${certificate.supplementName}` : "")} />
                <VerificationField label="Provider" value={certificate.trainingProvider} />
                <VerificationField label="Status" value={getStatus(certificate.expirationDate)} />
              </div>

              {/* Go Back Button */}
              <div className="mt-8">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white" asChild>
                  <Link href="/search">Go Back</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <Alert variant="destructive" className="mb-6">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Certificate Not Found</AlertTitle>
                <AlertDescription>{error || `The certificate ID "${id}" is not valid or could not be found in our records.`}</AlertDescription>
              </Alert>

              <p className="text-muted-foreground mb-6">Please check the ID or generate a new certificate.</p>

              <Button asChild className="w-full">
                <Link href="/">Generate a New Certificate</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
