"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const iadcLogo = PlaceHolderImages.find((img) => img.id === "iadc-logo");

export function SearchForm() {
  const [certificateId, setCertificateId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for certificate ID in URL parameters (from QR code scan)
  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      setCertificateId(idFromUrl);
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificateId.trim()) {
      alert("Please enter a certificate number");
      return;
    }

    setIsSearching(true);

    // Navigate to verify page with the certificate ID
    router.push(`/verify/${encodeURIComponent(certificateId.trim())}`);
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <Card className="shadow-xl border border-gray-200">
          <CardContent className="p-8">
            {/* IADC Logo */}
            <div className="flex justify-center mb-8">
              {iadcLogo && <Image src={iadcLogo.imageUrl} alt={iadcLogo.description} width={120} height={40} className="h-10 w-auto" />}
            </div>

            {/* QR Code Detection Message */}
            {searchParams.get("id") && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Search className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Certificate Number detected from QR code! Click "Search" to verify.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-6" style={{ display: "block" }}>
              <div>
                <label htmlFor="certificateId" className="block text-sm font-medium text-red-600 mb-3">
                  Enter Certificate Number
                </label>
                <Input
                  id="certificateId"
                  type="text"
                  placeholder="25N20K14-30L2F9"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  className="w-full h-12 text-lg border-2 border-gray-300 rounded-md px-4 focus:border-red-600 focus:ring-2 focus:ring-red-100"
                  disabled={isSearching}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-red-700 hover:bg-red-800 text-white font-semibold text-base rounded-md shadow-md"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <Search className="mr-2 h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </>
                )}
              </Button>
            </form>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">Having trouble? Make sure you have the complete certificate number including all letters and numbers.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
