"use client";

import PageSuspense from "@/app/components/PageSuspense/PageSuspense";
import CheckInConfirmationPage from "./CheckInContent";

export default function CheckInConfirmation() {
  return (
    <PageSuspense>
      <CheckInConfirmationPage />
    </PageSuspense>
  );
}