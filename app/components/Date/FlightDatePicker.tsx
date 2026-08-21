"use client";

import { addDays } from "date-fns";
import { useEffect, useState } from "react";
import { Calendar, DateRange, type Range, type RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import useFlightSearchBarStore from "@/app/zustand/storeFlightSearchBar";
import type { FlightDatePickerProps, TripType } from "@/types/flight-date-picker";

export default function FlightDatePicker({ onChangeDate }: FlightDatePickerProps) {
  const [tripType, setTripType] = useState<TripType>("one_way");
  const [range, setRange] = useState<Range>({
    startDate: new Date(),
    endDate: addDays(new Date(), 5),
    key: "selection",
  });
  const [initializedFromStore, setInitializedFromStore] = useState(false);

  const { data, isHydrated, setData } = useFlightSearchBarStore();

  const handleRangeSelect = (ranges: RangeKeyDict) => {
    const selected = ranges.selection;

    const newRange: Range = {
      startDate: selected.startDate || new Date(),
      endDate: selected.endDate || selected.startDate || new Date(),
      key: "selection",
    };

    setRange(newRange);

    // luôn update zustand
    if (newRange.startDate) {
      setData({
        startDate: newRange.startDate?.toLocaleDateString("vi-VN"),
        endDate: newRange.endDate?.toLocaleDateString("vi-VN"),
      });

      // callback là optional
      onChangeDate?.({
        startDate: newRange.startDate,
        endDate: newRange.endDate,
      });
    }
  };

  const handleOneWaySelect = (date: Date) => {
    const newRange: Range = {
      startDate: date,
      endDate: date,
      key: "selection",
    };

    setRange(newRange);

    setData({
      startDate: date?.toLocaleDateString("vi-VN"),
      endDate: "",
    });

    onChangeDate?.({ startDate: date });
  };

  useEffect(() => {
    setData({ service: tripType });
  }, [tripType, setData]);

  // Parse date string "dd/mm/yyyy" (vi-VN) to Date
  const parseViDate = (value?: string): Date | undefined => {
    if (!value) return undefined;
    const parts = value.split("/");
    if (parts.length !== 3) return undefined;
    const [day, month, year] = parts.map((p) => Number(p));
    if (!day || !month || !year) return undefined;
    return new Date(year, month - 1, day);
  };

  // Khi store đã hydrate, đồng bộ tripType + range từ state đã lưu
  useEffect(() => {
    if (!isHydrated || initializedFromStore) return;

    const savedTripType = (data.service as TripType) || "one_way";
    const savedStart = parseViDate(data.startDate);
    const savedEnd = parseViDate(data.endDate);

    if (savedTripType === "round_trip" && savedStart && savedEnd) {
      setTripType("round_trip");
      setRange({
        startDate: savedStart,
        endDate: savedEnd,
        key: "selection",
      });
    } else if (savedStart) {
      // one_way hoặc round_trip nhưng mới chọn ngày đi
      setTripType("one_way");
      setRange({
        startDate: savedStart,
        endDate: savedStart,
        key: "selection",
      });
    }

    setInitializedFromStore(true);
  }, [isHydrated, initializedFromStore, data.service, data.startDate, data.endDate]);

  const _formatDate = (date?: Date) => (date ? date.toLocaleDateString("vi-VN") : "");

  return (
    <div className="flex flex-col gap-2 w-full  bg-white rounded-md p-4 overflow-hidden">
      {/* Loại chuyến đi */}
      <div className="flex items-center gap-6 text-[1.4rem] font-medium text-gray-700">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="tripType"
            value="oneway"
            checked={tripType === "one_way"}
            onChange={() => setTripType("one_way")}
            className="accent-[var(--cl-pri)]"
          />
          <span>One way</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="tripType"
            value="round"
            checked={tripType === "round_trip"}
            onChange={() => setTripType("round_trip")}
            className="accent-[var(--cl-pri)]"
          />
          <span>Round trip</span>
        </label>
      </div>

      {/* Lịch */}
      {tripType === "one_way" ? (
        <Calendar
          date={range.startDate || new Date()}
          onChange={(date: Date) => handleOneWaySelect(date)}
          showDateDisplay={false}
          minDate={new Date()}
        />
      ) : (
        <DateRange
          onChange={handleRangeSelect}
          moveRangeOnFirstSelection={false}
          ranges={[range]}
          months={2}
          direction="horizontal"
          showDateDisplay={false}
          editableDateInputs={false}
          minDate={new Date()}
        />
      )}
    </div>
  );
}
