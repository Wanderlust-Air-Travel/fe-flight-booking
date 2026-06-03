"use client";

import { Suspense } from "react";
import CheckInConfirmationPage from "./CheckInContent";

export default function CheckInConfirmation() {
    return (
        <Suspense
            fallback={
                <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
                    <div className="container">
                        <div className="max-w-2xl mx-auto py-[4rem] sm:py-[6rem]">
                            <div className="bg-white rounded-[1.2rem] shadow-lg p-[3rem] sm:p-[3.2rem] md:p-[4rem] border border-[var(--cl-six)] animate-pulse">
                                <div className="flex flex-col items-center gap-[2rem]">
                                    <div className="w-[8rem] h-[8rem] bg-gray-200 rounded-full" />
                                    <div className="h-[2.4rem] w-[20rem] bg-gray-200 rounded" />
                                    <div className="h-[1.4rem] w-[28rem] bg-gray-200 rounded" />
                                    <div className="h-[6rem] w-full bg-gray-100 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            }
        >
            <CheckInConfirmationPage />
        </Suspense>
    );
}
