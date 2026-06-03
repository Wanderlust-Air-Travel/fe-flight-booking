"use client";

import { Suspense } from "react";
import CheckInSeatSelectionContent from "./CheckInSeatSelectionContent";

function LoadingSkeleton() {
    return (
        <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)] min-h-screen bg-gray-50">
            <div className="container py-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-64" />
                    <div className="h-64 bg-gray-200 rounded" />
                    <div className="h-96 bg-gray-200 rounded" />
                </div>
            </div>
        </main>
    );
}

export default function CheckInSeatSelectionPage() {
    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <CheckInSeatSelectionContent />
        </Suspense>
    );
}
