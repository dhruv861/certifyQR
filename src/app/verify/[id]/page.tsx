"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
import type { CertificateData, Certificate } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useFirebase } from "@/firebase";
import { PlaceHolderImages } from "@/lib/placeholder-images";

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
    if (!firestore || !id) {
      setIsLoading(false);
      setError("Invalid request.");
      return;
    }

    const certRef = doc(firestore, "iadc_certificates", id);

    const unsubscribe = onSnapshot(
      certRef,
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
        setError("An error occurred while trying to verify the certificate. You may not have permission to view it.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
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
              <div className="flex justify-center mb-8">
                {iadcLogo && <Image src={iadcLogo.imageUrl} alt={iadcLogo.description} width={150} height={50} className="h-12 w-auto" />}
              </div>

              {/* Certificate Details */}
              <div className="space-y-0">
                <VerificationField label="Certificate ID" value={certificate.id.replace("CERT-", "").split("-").slice(0, -1).join("-")} />
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
