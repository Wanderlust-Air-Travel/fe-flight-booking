// InputFormat.tsx
import { Input } from "@/components/ui/input";

import { InputProps } from "@/types/input-props";
import { useFormikInput } from "./UseFormikInput";



export const InputFormat = ({
    name,
    label,
    placeholder,
    type = "text",
}: InputProps) => {
    const { field, error, isError } = useFormikInput(name);

    return (
        <label className="flex flex-col gap-y-[0.8rem]">
            <p className="text-mn text-[var(--cl-pri)] font-medium">{label}</p>
            <div className="relative">
                <Input className="h-[4rem] px-[1rem] flex items-center placeholder:text-[var(--cl-six)] !text-[var(--cl-pri)] text-mn border-[0.1rem] border-[var(--cl-six)] focus:!border-[var(--cl-pri)] transition ease-linear" {...field} type={type} placeholder={placeholder} />
                {isError && <p className="text-xs text-red-500 inputError">{error}</p>}
            </div>
        </label>
    );
};
