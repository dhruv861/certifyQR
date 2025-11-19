"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const iadcLogo = PlaceHolderImages.find((img) => img.id === "iadc-logo");

export default function SearchPage() {
  const [certificateId, setCertificateId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificateId.trim()) {
      alert("Please enter a certificate ID");
      return;
    }

    setIsSearching(true);

    // Navigate to verify page with the certificate ID
    router.push(`/verify/${encodeURIComponent(certificateId.trim())}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {/* IADC Logo */}
            <div className="flex justify-center mb-8">
              {iadcLogo && <Image src={iadcLogo.imageUrl} alt={iadcLogo.description} width={150} height={50} className="h-12 w-auto" />}
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificate Verification</h1>
              <p className="text-gray-600">Enter the certificate ID to verify its authenticity</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate ID
                </label>
                <Input
                  id="certificateId"
                  type="text"
                  placeholder="Enter certificate ID (e.g., CERT-1234567890-ABC123)"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  className="w-full"
                  disabled={isSearching}
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isSearching}>
                {isSearching ? (
                  <>
                    <Search className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Verify Certificate
                  </>
                )}
              </Button>
            </form>

            {/* Navigation Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </Button>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">Having trouble? Make sure you have the complete certificate ID including all letters and numbers.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
