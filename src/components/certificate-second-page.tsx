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

  // Use the idNumber from the form data
  const certificateNumber = data.idNumber;

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
        <div className="w-[380px] bg-gradient-to-br from-white to-gray-50 border border-gray-400 shadow-lg font-sans">
          {/* Header */}
          <div className="bg-[#D41826] text-white text-center py-1 font-bold text-xs tracking-wide">IADC WellSharp Course Completion Card</div>

          {/* Certificate Details */}
          <div className="p-2 space-y-0">
            {/* Trainee Name */}
            <div className="flex items-end">
              <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">Trainee Name</span>
              <div className="flex-grow border-b border-gray-400 ml-1 px-1 text-gray-900 text-xs leading-tight">{data.traineeName}</div>
            </div>

            {/* Course Name */}
            <div className="flex items-end mt-1">
              <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">Course Name</span>
              <div className="flex-grow border-b border-gray-400 ml-1 px-1 text-gray-900 text-xs leading-tight">{data.courseName}</div>
            </div>

            {/* Supplement Name */}
            <div className="flex items-end mt-1">
              <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">Supplement Name</span>
              <div className="flex-grow border-b border-gray-400 ml-1 px-1 text-gray-900 text-xs h-4 leading-tight">{data.supplementName || ""}</div>
            </div>

            {/* Completion Date and Expiration Date */}
            <div className="flex gap-2 mt-1">
              <div className="flex items-end w-1/2">
                <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">Completion Date</span>
                <div className="flex-grow border-b border-gray-400 ml-1 px-1 text-gray-900 text-xs leading-tight">{formatDate(data.completionDate)}</div>
              </div>
              <div className="flex items-end w-1/2">
                <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">Expiration Date</span>
                <div className="flex-grow border-b border-gray-400 ml-1 px-1 text-gray-900 text-xs leading-tight">
                  {data.expirationDate ? formatDate(data.expirationDate) : ""}
                </div>
              </div>
            </div>

            {/* Provider */}
            <div className="flex items-end mt-1">
              <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">Provider</span>
              <div className="flex-grow border-b border-gray-400 ml-1 px-1 text-gray-900 text-xs leading-tight">{data.trainingProvider}</div>
            </div>

            {/* Provider # and Phone # */}
            <div className="flex gap-2 mt-1">
              <div className="flex items-end w-5/12">
                <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">Provider #</span>
                <div className="flex-grow border-b border-gray-400 ml-1 px-1 text-gray-900 text-xs leading-tight">00001153</div>
              </div>
              <div className="flex items-end w-7/12">
                <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">Phone #</span>
                <div className="flex-grow border-b border-gray-400 ml-1 px-1 text-gray-900 text-xs leading-tight">{data.telephone || ""}</div>
              </div>
            </div>

            {/* Instructor Name */}
            <div className="flex items-end mt-1">
              <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">Instructor Name</span>
              <div className="flex-grow border-b border-gray-400 ml-1 px-1 text-gray-900 text-xs leading-tight">{data.instructorName}</div>
            </div>

            {/* Certificate Number */}
            <div className="flex justify-end items-center mt-2 pt-1">
              <span className="text-[9px] text-gray-600 mr-1">Certificate Number:</span>
              <span className="text-[9px] text-gray-900 tracking-wide">{certificateNumber}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
