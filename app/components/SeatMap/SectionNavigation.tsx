"use client";

import { memo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface SectionNavigationProps {
  sections: Array<{ name: string; id: string; label: string }>;
  onNavigate: (sectionId: string) => void;
  cabinType: "business" | "economy";
}

/**
 * Navigation component for scrolling between seat sections
 */
const SectionNavigation = memo(function SectionNavigation({
  sections,
  onNavigate,
  cabinType,
}: SectionNavigationProps) {
  if (sections.length === 0) return null;

  const colorClass =
    cabinType === "business"
      ? "text-[var(--cl-pri)] border-[var(--cl-pri)] hover:bg-[var(--cl-pri)]"
      : "text-[var(--cl-five)] border-[var(--cl-five)] hover:bg-[var(--cl-five)]";

  return (
    <div className="flex flex-col gap-y-[0.8rem]">
      <p className="text-sm font-medium text-[var(--cl-four)] mb-[0.4rem]">
        Navigate Sections:
      </p>
      <div className="flex flex-col gap-y-[0.4rem]">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            className={`px-[1.2rem] py-[0.8rem] rounded-md border-2 ${colorClass} hover:text-white transition ease-linear text-left text-sm font-medium`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
});

SectionNavigation.displayName = "SectionNavigation";

export default SectionNavigation;

