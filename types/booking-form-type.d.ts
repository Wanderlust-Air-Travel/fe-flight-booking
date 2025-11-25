export interface PassengerFormData {
    passengerType: "ADT" | "CHD" | "INF";
    fullname: string;
    dob: string;
    gender: string;
    documentNumber: string;
    loyaltyNumber?: string;
}

export interface BookingFormData {
    contactFullname: string;
    contactEmail: string;
    contactPhone: string;
    passengers: PassengerFormData[];
}

