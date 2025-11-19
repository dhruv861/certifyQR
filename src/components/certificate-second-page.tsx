"use client";

import Image from "next/image";
import type { CertificateData } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface CertificateSecondPageProps {
  data: CertificateData;
}

const iadcLogo = PlaceHolderImages.find((img) => img.id === "iadc-logo");

export function CertificateSecondPage({ data }: CertificateSecondPageProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Extract certificate number from ID - cleaner format
  const certificateNumber = data.id.replace("CERT-", "").replace(/-/g, "");

  return (
    <div id="certificate-page-2" className="bg-white w-full aspect-[1/1.414] p-6 flex gap-6 px-9">
      {/* Left Side - IADC Branding and Info */}
      <div className="w-1/2 flex flex-col">
        {/* IADC Logo and Branding */}
        <div className="mb-1">
          {iadcLogo && <Image src={iadcLogo.imageUrl} alt={iadcLogo.description} width={100} height={32} className="h-8 w-auto mb-3" />}
        </div>

        {/* Description Text and QR Code side by side */}
        <div className="flex gap-4 items-start">
          {/* Description Text */}
          <div className="flex-1 text-xs text-black leading-normal space-y-3">
            <p>
              This individual has successfully completed a well control course at an institution accredited by the International Association of Drilling
              Contractors.
            </p>
            <p>For scheduling training or replacement of lost card, please call the training provider with information provided on this completion card.</p>
            <p>To verify validity, please visit the IADC website:</p>
            <p className="font-bold text-black">www.iadc.org/wellsharp</p>
          </div>

          {/* QR Code on the right side */}
          <div className="flex-shrink-0 ">
            {data.qrCodeDataUri && <Image src={data.qrCodeDataUri} alt="Certificate Verification QR Code" width={60} height={60} />}
          </div>
        </div>
      </div>

      {/* Right Side - Course Completion Card */}
      <div className="w-1/2">
        <div className="border border-gray-800 inline-block">
          {/* Header */}
          <div className="bg-red-700 text-white text-center py-1 px-4">
            <h2 className="text-xs font-bold">IADC WellSharp Course Completion Card</h2>
          </div>

          {/* Certificate Details Table */}
          <div className="text-xs">
            {/* Row 1 - Trainee Name */}
            <div className="bg-gray-200 px-2 py-1 border-b border-gray-400">
              <span className="text-black font-medium">Trainee Name: </span>
              <span className="font-bold text-black">{data.traineeName}</span>
            </div>

            {/* Row 2 - Course Name */}
            <div className="bg-white px-2 py-1 border-b border-gray-400">
              <span className="text-black font-medium">Course Name: </span>
              <span className="font-bold text-black">{data.courseName}</span>
            </div>

            {/* Row 3 - Supplement Name */}
            <div className="bg-gray-200 px-2 py-1 border-b border-gray-400">
              <span className="text-black font-medium">Supplement Name: </span>
              <span className="font-bold text-black">{data.supplementName || ""}</span>
            </div>

            {/* Row 4 - Completion Date and Expiration Date */}
            <div className="bg-white px-2 py-1 border-b border-gray-400 flex">
              <div className="flex-1">
                <span className="text-black font-medium">Completion Date: </span>
                <span className="font-bold text-black">{formatDate(data.completionDate)}</span>
              </div>
              <div className="flex-1">
                <span className="text-black font-medium">Expiration Date: </span>
                <span className="font-bold text-black">{data.expirationDate ? formatDate(data.expirationDate) : ""}</span>
              </div>
            </div>

            {/* Row 5 - Provider */}
            <div className="bg-gray-200 px-2 py-1 border-b border-gray-400">
              <span className="text-black font-medium">Provider: </span>
              <span className="font-bold text-black">{data.trainingProvider}</span>
            </div>

            {/* Row 6 - Provider # and Phone # */}
            <div className="bg-white px-2 py-1 border-b border-gray-400 flex">
              <div className="flex-1">
                <span className="text-black font-medium">Provider #: </span>
                <span className="font-bold text-black">00001153</span>
              </div>
              <div className="flex-1">
                <span className="text-black font-medium">Phone #: </span>
                <span className="font-bold text-black">{data.telephone || ""}</span>
              </div>
            </div>

            {/* Row 7 - Instructor Name */}
            <div className="bg-gray-200 px-2 py-1 border-b border-gray-400">
              <span className="text-black font-medium">Instructor Name: </span>
              <span className="font-bold text-black">{data.instructorName}</span>
            </div>

            {/* Row 8 - Certificate Number */}
            <div className="bg-white px-2 py-1">
              <span className="text-black font-medium">Certificate Number: </span>
              <span className="font-bold text-black">{certificateNumber}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
