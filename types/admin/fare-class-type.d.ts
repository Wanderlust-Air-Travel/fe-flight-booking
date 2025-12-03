export interface FareClass {
    fareClassCode: string;
    cabinClassCode: string;
    cabinClass?: {
        cabinClassCode: string;
        name: string;
    };
    description: string | null;
    changeRule: string | null;
    refundRule: string | null;
}

