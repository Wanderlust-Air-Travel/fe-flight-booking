import { SeatGroup } from "./seat-type";
import { SeatRow, SeatSection } from "./seat-utils-type";

export interface SeatRowProps {
    row: SeatRow;
    cabinType: "business" | "economy";
    selectedSeats: string[];
    onSeatToggle: (seatId: string, checked: boolean) => void;
    isSelectable: boolean;
}

export interface SectionNavigationProps {
    sections: Array<{ name: string; id: string; label: string }>;
    onNavigate: (sectionId: string) => void;
    cabinType: "business" | "economy";
}

export interface CabinSectionProps {
    seatGroup: SeatGroup | null;
    cabinType: "business" | "economy";
    selectedSeats: string[];
    onSeatToggle: (seatId: string, checked: boolean) => void;
    isSelectable: boolean;
}

export interface SeatSectionProps {
    section: SeatSection;
    cabinType: "business" | "economy";
    selectedSeats: string[];
    onSeatToggle: (seatId: string, checked: boolean) => void;
    isSelectable: boolean;
    sectionId: string;
}

