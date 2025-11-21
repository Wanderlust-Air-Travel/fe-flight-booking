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




export interface ListProps {
    type: string,
    list: {
        typeTicket: string,
        price: number,
        desc: {
            text: string,
            status: boolean
        }[]
    }[]
}

interface TicketProps {
    tickets: TicketItem;
    type: string;
    index: number;
    active: boolean;
    onChoose: () => void;   // nhận hàm từ cha
}