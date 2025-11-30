export interface MenuListsInterface {
    title: string;
    path: string;
    child?: MenuListsInterface[];
}

export interface IsActiveState {
    isActive: boolean;
    handleIsActive: () => void;
}