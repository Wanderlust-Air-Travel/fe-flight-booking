export interface Role {
    roleCode: string;
    name: string;
    description: string | null;
}

export interface User {
    userId: string;
    fullname: string;
    email: string;
    phone: string | null;
    roles?: Role[];
}

