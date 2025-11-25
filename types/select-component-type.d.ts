export interface SelectComponentProp {
    placeholder: string;
    icon: string;
    value: string;
    onChange: (val: string) => void;
    data: {
        name: string;
        des: string;
        value: string;
        code: string;
    }[];
}

