import { Suspense, type ReactNode } from "react";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";

/**
 * Shared Suspense boundary for pages that use `useSearchParams`.
 * Next.js requires `useSearchParams` to be inside a Suspense boundary at static render time.
 */
export default function PageSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="flex flex-col pt-[var(--head)] gap-y-[var(--rowY)]">
          <Breadcrumb />
          <div className="container">
            <div className="text-center py-[4rem]">
              <p className="text-lg">Loading...</p>
            </div>
          </div>
        </main>
      }
    >
      {children}
    </Suspense>
  );
}