import { ItemServiceProp } from "./item-service-type";

export interface UseDealsResult {
    services: ItemServiceProp[];
    loading: boolean;
    error: string | null;
}

