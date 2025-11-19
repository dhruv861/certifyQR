import { Suspense } from "react";
import { SearchForm } from "@/components/search-form";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Loading component for Suspense fallback
function SearchFormLoading() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <Card className="shadow-xl border border-gray-200">
          <CardContent className="p-8">
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFormLoading />}>
      <SearchForm />
    </Suspense>
  );
}
