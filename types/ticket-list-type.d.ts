export interface TicketListType {
    id: number;
    type: string;
    code: number;
    list: {
        typeTicket: string,
        price: number,
        desc: {
            text: string,
            status: boolean
        }[]
    }[]
}




// Backend API Response Format (matching FareOptionDto from backend)
export interface FareOption {
    typeTicket: string;
    name?: string;
    description?: string;
    price: number;
    desc: {
        text: string;
        status: boolean;
    }[];
    fareClassCode: string;
}

// Backend API Response Format (matching FareOptionsResponseDto from backend)
export interface FareOptionsResponse {
    flightInstanceId: string;
    cabinType: string;
    fareOptions: FareOption[];
}

// Legacy type for backward compatibility
export interface ListProps {
    type: string,
    list: {
        typeTicket: string,
        price: number,
        desc: {
            text: string,
            status: boolean
        }[],
        fareClassCode?: string;
    }[]
}

export type TicketItem = FareOption;

interface TicketProps {
    tickets: TicketItem;
    type: string;
    index: number;
    active: boolean;
    onChoose: () => void;   // nhận hàm từ cha
    /** Nhãn hiển thị phân biệt khi nhiều hạng vé trùng typeTicket (vd. Economy Saver Max vs Economy Saver Max Extended) */
    displayLabel?: string;
}