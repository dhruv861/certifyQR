"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CertificatePreview } from "@/components/certificate-preview";
import type { CertificateData } from "@/lib/types";

interface CertificatePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: CertificateData | null;
}

export function CertificatePreviewDialog({ isOpen, onClose, certificateData }: CertificatePreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Certificate Preview</DialogTitle>
        </DialogHeader>
        {certificateData && (
          <div className="mt-4">
            <CertificatePreview data={certificateData} isLoading={false} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
