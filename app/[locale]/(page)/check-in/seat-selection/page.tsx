"use client";

import PageSuspense from "@/app/components/PageSuspense/PageSuspense";
import CheckInSeatSelectionContent from "./CheckInSeatSelectionContent";

export default function CheckInSeatSelectionPage() {
  return (
    <PageSuspense>
      <CheckInSeatSelectionContent />
    </PageSuspense>
  );
}