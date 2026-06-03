"use client";

import { Suspense } from "react";
import CheckInPageContent from "./CheckInPageContent";

export default function CheckInPage() {
    return (
        <Suspense
            fallback={
                <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)] min-h-screen bg-gray-50">
                    <div className="container">
                        <div className="max-w-2xl mx-auto py-8 md:py-12 lg:py-16">
                            <div className="bg-white rounded-lg shadow-md p-6 md:p-8 animate-pulse">
                                <div className="space-y-4">
                                    <div className="h-8 bg-gray-200 rounded w-48 mx-auto" />
                                    <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
                                    <div className="h-12 bg-gray-200 rounded mt-6" />
                                    <div className="h-14 bg-gray-200 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            }
        >
            <CheckInPageContent />
        </Suspense>
    );
}
