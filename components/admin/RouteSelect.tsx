import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Route } from "@/types/admin/route-type";
import { ArrowRight } from "lucide-react";

interface RouteSelectProps {
  value: string;
  routes: Route[];
  onChange: (routeId: string) => void;
  disabled?: boolean;
}

export function RouteSelect({ value, routes, onChange, disabled = false }: RouteSelectProps) {
  const selectedRoute = routes.find((r) => r.routeId === value);

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold text-gray-700">
        Tuyến bay <span className="text-red-500 ml-1">*</span>
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-14 text-base">
          <SelectValue placeholder="Chọn tuyến bay" />
        </SelectTrigger>
        <SelectContent>
          {routes.map((route) => (
            <SelectItem key={route.routeId} value={route.routeId} className="text-base py-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{route.originAirport?.iataCode}</span>
                <span className="text-gray-500">{route.originAirport?.city}</span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span className="font-semibold">{route.destinationAirport?.iataCode}</span>
                <span className="text-gray-500">{route.destinationAirport?.city}</span>
                {route.distance && (
                  <span className="text-xs text-gray-400 ml-2">({route.distance} km)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedRoute && (
        <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-600">Xuất phát:</span>{" "}
              <span className="font-semibold">{selectedRoute.originAirport?.name}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div>
              <span className="text-gray-600">Đến:</span>{" "}
              <span className="font-semibold">{selectedRoute.destinationAirport?.name}</span>
            </div>
          </div>
          {selectedRoute.distance && (
            <div className="mt-2 text-sm text-gray-600">
              Khoảng cách: <span className="font-semibold">{selectedRoute.distance} km</span>
            </div>
          )}
          <div className="mt-1 text-xs text-gray-500">
            {selectedRoute.isDomestic ? "Chuyến bay nội địa" : "Chuyến bay quốc tế"}
          </div>
        </div>
      )}
    </div>
  );
}
