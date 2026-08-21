import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DayChipPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const DAYS = [
  { label: "CN", index: 0 },
  { label: "T2", index: 1 },
  { label: "T3", index: 2 },
  { label: "T4", index: 3 },
  { label: "T5", index: 4 },
  { label: "T6", index: 5 },
  { label: "T7", index: 6 },
];

export function DayChipPicker({ value, onChange, disabled = false }: DayChipPickerProps) {
  const toggleDay = (index: number) => {
    if (disabled) return;
    const arr = value.split("");
    arr[index] = arr[index] === "1" ? "0" : "1";
    onChange(arr.join(""));
  };

  const selectedCount = value.split("").filter((d) => d === "1").length;

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold text-gray-700">
        Ngày hoạt động <span className="text-red-500 ml-1">*</span>
      </Label>
      <div className="flex gap-2">
        {DAYS.map((day) => {
          const isSelected = value[day.index] === "1";
          return (
            <Button
              key={day.index}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => toggleDay(day.index)}
              disabled={disabled}
              className={cn(
                "h-10 w-12 font-semibold transition-all",
                isSelected
                  ? "bg-[#00558f] hover:bg-[#004475] text-white"
                  : "border-gray-300 hover:border-[#00558f] hover:bg-[#00558f]/5"
              )}
            >
              {day.label}
            </Button>
          );
        })}
      </div>
      <p className="text-sm text-gray-500">
        {selectedCount === 0 && "Chưa chọn ngày nào"}
        {selectedCount === 7 && "Hoạt động hàng ngày"}
        {selectedCount > 0 && selectedCount < 7 && `${selectedCount} ngày được chọn`}
      </p>
    </div>
  );
}
