import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AircraftType } from "@/types/admin/aircraft-type";
import { Plane } from "lucide-react";

interface AircraftTypeSelectProps {
  value: string;
  aircraftTypes: AircraftType[];
  onChange: (aircraftTypeId: string) => void;
  disabled?: boolean;
}

export function AircraftTypeSelect({
  value,
  aircraftTypes,
  onChange,
  disabled = false,
}: AircraftTypeSelectProps) {
  const selectedType = aircraftTypes.find((t) => t.aircraftTypeId === value);

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold text-gray-700">
        Loại tàu bay <span className="text-red-500 ml-1">*</span>
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-14 text-base">
          <SelectValue placeholder="Chọn loại tàu bay" />
        </SelectTrigger>
        <SelectContent>
          {aircraftTypes.map((type) => (
            <SelectItem
              key={type.aircraftTypeId}
              value={type.aircraftTypeId}
              className="text-base py-3"
            >
              <div className="flex items-center gap-3">
                <Plane className="h-4 w-4 text-gray-400" />
                <span className="font-mono font-semibold">{type.typeCode}</span>
                <span className="text-gray-600">
                  {type.manufacturer} {type.model}
                </span>
                <span className="text-xs text-gray-400">({type.totalSeats} ghế)</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedType && (
        <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-[#00558f]" />
            <div>
              <div className="font-semibold">
                {selectedType.manufacturer} {selectedType.model}
              </div>
              <div className="text-sm text-gray-600">
                Mã: <span className="font-mono">{selectedType.typeCode}</span> · Tổng số ghế:{" "}
                {selectedType.totalSeats}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
