export interface SignupFormValue {
    email: string;
    password: string | number;
    fullname: string;
    phone: number | null;
}

export interface SigninFormValue {
    identifier: string | number;
    password: string | number;
    remember: boolean;
}

