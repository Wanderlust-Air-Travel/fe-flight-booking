import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AirlineListItem } from "@/types/admin/airline-type";

interface FlightNumberInputProps {
  airlineCode: string;
  flightNumber: string;
  airlines: AirlineListItem[];
  onAirlineChange: (code: string) => void;
  onFlightNumberChange: (number: string) => void;
  disabled?: boolean;
}

export function FlightNumberInput({
  airlineCode,
  flightNumber,
  airlines,
  onAirlineChange,
  onFlightNumberChange,
  disabled = false,
}: FlightNumberInputProps) {
  const fullFlightNumber = airlineCode && flightNumber ? `${airlineCode}${flightNumber}` : "";

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold text-gray-700">
        Số hiệu chuyến bay <span className="text-red-500 ml-1">*</span>
      </Label>
      <div className="flex gap-3">
        <div className="w-32">
          <Select value={airlineCode} onValueChange={onAirlineChange} disabled={disabled}>
            <SelectTrigger className="h-14">
              <SelectValue placeholder="Hãng" />
            </SelectTrigger>
            <SelectContent>
              {airlines.map((airline) => (
                <SelectItem key={airline.airlineId} value={airline.iataCode}>
                  {airline.iataCode} · {airline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Số hiệu (1-4 chữ số)"
            value={flightNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 4);
              onFlightNumberChange(value);
            }}
            disabled={disabled}
            className="h-14 text-base"
          />
        </div>
      </div>
      {fullFlightNumber && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Mã chuyến bay:</span>
          <span className="font-mono font-semibold text-[#00558f]">{fullFlightNumber}</span>
        </div>
      )}
      <p className="text-sm text-gray-500">
        Chọn hãng khai thác IATA 2 ký tự và nhập số hiệu 1-4 chữ số
      </p>
    </div>
  );
}
