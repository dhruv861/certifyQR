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
      month: "short",
      year: "numeric",
    });
  };

  // Use the auto-generated certificateNumber
  const certificateNumber = data.certificateNumber;

  return (
    <div id="certificate-page-2" className="bg-white w-full aspect-[1/1.414] p-6 flex gap-6 px-9 pdf-page-2-container">
      {/* Left Side - IADC Branding and Info */}
      <div className="w-1/2 flex flex-col pdf-left-section">
        {/* IADC Logo and Branding */}
        <div className="mb-0.5 pdf-logo-container">
          {iadcLogo && (
            <>
              {/* Next.js Image for preview */}
              <Image src={iadcLogo.imageUrl} alt={iadcLogo.description} width={80} height={26} className="h-6 w-auto mb-1 pdf-hide" />
              {/* Regular img for PDF generation */}
              <img
                src={iadcLogo.imageUrl}
                alt={iadcLogo.description}
                style={{ width: "80px", height: "26px", objectFit: "contain", marginBottom: "4px" }}
                className="pdf-show hidden"
                crossOrigin="anonymous"
              />
            </>
          )}
        </div>

        {/* Description Text and QR Code side by side */}
        <div className="flex gap-2 items-start pdf-description-section">
          {/* Description Text */}
          <div className="flex-1 text-[10px] text-black leading-tight space-y-1">
            <p>
              This individual has successfully completed a well control course at an institution accredited by the International Association of Drilling
              Contractors.
            </p>
            <p>For scheduling training or replacement of lost card, please call the training provider with information provided on this completion card.</p>
            <p>To verify validity, please visit the IADC website:</p>
            <p className="font-bold text-black">www.iadc.org/wellsharp</p>
          </div>

          {/* QR Code on the right side */}
          <div className="flex-shrink-0">
            {data.qrCodeDataUri && (
              <>
                {/* Next.js Image for preview */}
                <Image src={data.qrCodeDataUri} alt="Certificate Verification QR Code" width={50} height={50} className="pdf-hide" />
                {/* Regular img for PDF generation */}
                <img src={data.qrCodeDataUri} alt="Certificate Verification QR Code" style={{ width: "50px", height: "50px" }} className="pdf-show hidden" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Course Completion Card */}
      <div className="w-1/2 pdf-completion-card-container">
        <div
          className="w-[340px] bg-gradient-to-br from-white to-gray-100 border border-gray-400 shadow-lg font-sans pdf-completion-card"
          style={{ background: "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)" }}
        >
          {/* Header */}
          <div className="bg-[#D41826] text-white text-center py-0.5 font-bold text-[10px] tracking-wide pdf-card-header">
            IADC WellSharp Course Completion Card
          </div>

          {/* Certificate Details */}
          <div className="p-1.5 space-y-0 pdf-card-content" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)" }}>
            {/* Trainee Name */}
            <div className="flex items-end pdf-field-row">
              <span className="text-[8px] font-bold text-gray-700 whitespace-nowrap pdf-field-label mb-0.5">Trainee Name</span>
              <div className="flex-grow border-b border-gray-400 ml-1 px-0.5 h-[14px] flex items-end pb-0.5 pdf-field-underline">
                <span className="text-[10px] text-gray-900 leading-none pdf-field-text">{data.traineeName}</span>
              </div>
            </div>

            {/* Course Name */}
            <div className="flex items-end mt-0.5 pdf-field-row">
              <span className="text-[8px] font-bold text-gray-700 whitespace-nowrap pdf-field-label mb-0.5">Course Name</span>
              <div className="flex-grow border-b border-gray-400 ml-1 px-0.5 h-[14px] flex items-end pb-0.5 pdf-field-underline">
                <span className="text-[10px] text-gray-900 leading-none pdf-field-text">{data.courseName}</span>
              </div>
            </div>

            {/* Supplement Name */}
            <div className="flex items-end mt-0.5 pdf-field-row">
              <span className="text-[8px] font-bold text-gray-700 whitespace-nowrap pdf-field-label mb-0.5">Supplement Name</span>
              <div className="flex-grow border-b border-gray-400 ml-1 px-0.5 h-[14px] flex items-end pb-0.5 pdf-field-underline">
                <span className="text-[10px] text-gray-900 leading-none pdf-field-text">{data.supplementName || ""}</span>
              </div>
            </div>

            {/* Completion Date and Expiration Date */}
            <div className="flex gap-1 mt-0.5 pdf-date-row">
              <div className="flex items-end w-1/2 pdf-field-row">
                <span className="text-[8px] font-bold text-gray-700 whitespace-nowrap pdf-field-label mb-0.5">Completion Date</span>
                <div className="flex-grow border-b border-gray-400 ml-1 px-0.5 h-[14px] flex items-end pb-0.5 pdf-field-underline">
                  <span className="text-[10px] text-gray-900 leading-none pdf-field-text">{formatDate(data.completionDate)}</span>
                </div>
              </div>
              <div className="flex items-end w-1/2 pdf-field-row">
                <span className="text-[8px] font-bold text-gray-700 whitespace-nowrap pdf-field-label mb-0.5">Expiration Date</span>
                <div className="flex-grow border-b border-gray-400 ml-1 px-0.5 h-[14px] flex items-end pb-0.5 pdf-field-underline">
                  <span className="text-[10px] text-gray-900 leading-none pdf-field-text">{data.expirationDate ? formatDate(data.expirationDate) : ""}</span>
                </div>
              </div>
            </div>

            {/* Provider */}
            <div className="flex items-end mt-0.5 pdf-field-row">
              <span className="text-[8px] font-bold text-gray-700 whitespace-nowrap pdf-field-label mb-0.5">Provider</span>
              <div className="flex-grow border-b border-gray-400 ml-1 px-0.5 h-[14px] flex items-end pb-0.5 pdf-field-underline">
                <span className="text-[10px] text-gray-900 leading-none pdf-field-text">{data.trainingProvider}</span>
              </div>
            </div>

            {/* Provider # and Phone # */}
            <div className="flex gap-1 mt-0.5 pdf-provider-row">
              <div className="flex items-end w-5/12 pdf-field-row">
                <span className="text-[8px] font-bold text-gray-700 whitespace-nowrap pdf-field-label mb-0.5">Provider #</span>
                <div className="flex-grow border-b border-gray-400 ml-1 px-0.5 h-[14px] flex items-end pb-0.5 pdf-field-underline">
                  <span className="text-[10px] text-gray-900 leading-none pdf-field-text">00001153</span>
                </div>
              </div>
              <div className="flex items-end w-7/12 pdf-field-row">
                <span className="text-[8px] font-bold text-gray-700 whitespace-nowrap pdf-field-label mb-0.5">Phone #</span>
                <div className="flex-grow border-b border-gray-400 ml-1 px-0.5 h-[14px] flex items-end pb-0.5 pdf-field-underline">
                  <span className="text-[10px] text-gray-900 leading-none pdf-field-text">{data.telephone || ""}</span>
                </div>
              </div>
            </div>

            {/* Instructor Name */}
            <div className="flex items-end mt-0.5 pdf-field-row">
              <span className="text-[8px] font-bold text-gray-700 whitespace-nowrap pdf-field-label mb-0.5">Instructor Name</span>
              <div className="flex-grow border-b border-gray-400 ml-1 px-0.5 h-[14px] flex items-end pb-0.5 pdf-field-underline">
                <span className="text-[10px] text-gray-900 leading-none pdf-field-text">{data.instructorName}</span>
              </div>
            </div>

            {/* Certificate Number */}
            <div className="flex justify-end items-center mt-1 pt-0.5">
              <span className="text-[8px] text-gray-600 mr-1 font-bold">Certificate Number:</span>
              <span className="text-[8px] text-gray-900 tracking-wide">{certificateNumber}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
