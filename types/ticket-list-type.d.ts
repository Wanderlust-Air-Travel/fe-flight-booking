export interface TicketListType {
    id: number;
    type: string;
    code:number;
    list: {
        typeTicket: string,
        price: number,
        desc: {
            text: string,
            status: boolean
        }[]
    }[]
}


export interface TicketProps {
    tickets: TicketListType;
}

export interface ListProps {
    list: {
        typeTicket: string,
        price: number,
        desc: {
            text: string,
            status: boolean
        }[]
    }[]
}