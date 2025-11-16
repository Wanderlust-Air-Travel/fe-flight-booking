export interface TripListType {
    id:number,
    code:number,
    startDate:string,
    endDate:string,
    icon: string;
    totalTime: string;
    airline: string;
    duration: string;
    durationLocation: string;
    stopCount: number;
    stopDuration: string;
    service:string,
    cabin:{
        type:string,
        title:string,
        price:number,
        quantity:number
    }[]
}


export interface TripListProps {
    trips: TripListType[];   // ← trips là MẢNG
}

