export interface PassengerFormData {
    passengerType: "ADT" | "CHD" | "INF";
    fullname: string;
    dob: string;
    gender: string;
    documentNumber: string;
    loyaltyNumber?: string;
    isCurrentUser?: boolean; // Flag to indicate if this passenger is the logged-in user
}

export interface BookingFormData {
    contactFullname: string;
    contactEmail: string;
    contactPhone: string;
    passengers: PassengerFormData[];
    isUserTraveling: boolean; // Flag to indicate if user is one of the passengers
    userPassengerIndex?: number; // Index of passenger that represents the current user (if isUserTraveling is true)
}

