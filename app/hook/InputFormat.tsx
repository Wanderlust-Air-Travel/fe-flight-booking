// InputFormat.tsx
import { Input } from "@/components/ui/input";
import { InputProps } from "@/types/input-props";
import { useFormikInput } from "./UseFormikInput";



export const InputFormat = ({
    name,
    label,
    placeholder,
    type = "text",
    formatDob = false,
}: InputProps) => {
    const { field, error, isError } = useFormikInput(name);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // ✨ Auto format DOB -> DD/MM/YYYY
        if (formatDob) {
            // Chỉ cho nhập số
            value = value.replace(/[^\d]/g, "");

            // Tự thêm /
            if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
            if (value.length > 5) value = value.slice(0, 5) + "/" + value.slice(5);

            // Giới hạn 10 ký tự (DD/MM/YYYY)
            if (value.length > 10) value = value.slice(0, 10);
        }

        field.onChange({
            target: {
                name: field.name,
                value,
            },
        });
    };

    return (
        <label className="flex flex-col gap-y-[0.8rem]">
            <p className="text-mn text-[var(--cl-pri)] font-medium">{label}</p>

            <div className="relative">
                <Input
                    {...field}
                    onChange={handleChange}
                    type={type}
                    placeholder={placeholder}
                    maxLength={formatDob ? 10 : undefined}
                    className="h-[4rem] px-[1rem] placeholder:text-[var(--cl-six)] !text-[var(--cl-pri)] text-mn border-[0.1rem] border-[var(--cl-six)] focus:!border-[var(--cl-pri)] transition ease-linear"
                />

                {isError && (
                    <p className="inputError">
                        {error}
                    </p>
                )}
            </div>
        </label>
    );
};
