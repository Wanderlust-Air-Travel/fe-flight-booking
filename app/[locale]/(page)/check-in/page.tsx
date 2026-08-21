"use client";

import PageSuspense from "@/app/components/PageSuspense/PageSuspense";
import CheckInPageContent from "./CheckInPageContent";

export default function CheckInPage() {
  return (
    <PageSuspense>
      <CheckInPageContent />
    </PageSuspense>
  );
}