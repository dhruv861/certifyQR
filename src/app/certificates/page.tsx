"use client";

import { useCollection } from "@/firebase";
import type { Certificate } from "@/lib/types";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { List, ShieldAlert, Eye, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ProtectedRoute } from "@/components/protected-route";
import { useState } from "react";
import { useFirebase } from "@/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { CertificatePreviewDialog } from "@/components/certificate-preview-dialog";
import type { CertificateData } from "@/lib/types";

function CertificatesPageContent() {
  const { data: certificates, loading, error } = useCollection<Certificate>("iadc_certificates");
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [previewCertificate, setPreviewCertificate] = useState<CertificateData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handlePreview = (cert: Certificate) => {
    // Convert Certificate to CertificateData format
    const certificateData: CertificateData = {
      ...cert,
      completionDate: new Date(cert.completionDate),
      expirationDate: cert.expirationDate ? new Date(cert.expirationDate) : undefined,
    };
    setPreviewCertificate(certificateData);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (certId: string) => {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Database connection not available.",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this certificate? This action cannot be undone.")) {
      return;
    }

    setDeletingId(certId);

    try {
      const certRef = doc(firestore, "iadc_certificates", certId);
      await deleteDoc(certRef);

      toast({
        title: "Success",
        description: "Certificate deleted successfully.",
        className: "bg-green-100 dark:bg-green-900",
      });
    } catch (error) {
      console.error("Error deleting certificate:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete certificate. Please try again.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              <List className="text-primary" />
              All Certificates
            </CardTitle>
            <CardDescription>A list of all generated certificates stored in the database.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!loading && !error && certificates && (
              <Table>
                <TableCaption>{certificates.length === 0 ? "No certificates found." : "A list of all generated certificates."}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trainee Name</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Completion Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.traineeName}</TableCell>
                      <TableCell>{cert.courseName}</TableCell>
                      <TableCell>{format(new Date(cert.completionDate), "PPP")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Verify Certificate */}
                          <Button asChild variant="outline" size="sm" title="Verify Certificate">
                            <Link href={`/verify/${cert.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>

                          {/* Preview Certificate */}
                          <Button variant="outline" size="sm" onClick={() => handlePreview(cert)} title="Preview Certificate">
                            <FileText className="h-4 w-4" />
                          </Button>

                          {/* Delete Certificate */}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(cert.id)}
                            disabled={deletingId === cert.id}
                            title="Delete Certificate"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Certificate Preview Dialog */}
      <CertificatePreviewDialog isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} certificateData={previewCertificate} />
    </>
  );
}

export default function CertificatesPage() {
  return (
    <ProtectedRoute>
      <CertificatesPageContent />
    </ProtectedRoute>
  );
}
