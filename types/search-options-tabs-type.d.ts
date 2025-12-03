export type SearchOption = "flight" | "booking-code" | "ticket-number" | "membership";

export interface SearchOptionsTabsProps {
  activeOption: SearchOption;
  onOptionChange: (option: SearchOption) => void;
}

