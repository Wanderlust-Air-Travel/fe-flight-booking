"use client";

import { useState } from "react";
import { DateRange, Range, RangeKeyDict } from "react-date-range";
import { addDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

type TripType = "oneway" | "round";

interface FlightDatePickerProps {
    onChangeDate?: (data: { startDate: Date; endDate?: Date }) => void;
}

export default function FlightDatePicker({ onChangeDate }: FlightDatePickerProps) {
    const [tripType, setTripType] = useState<TripType>("oneway");
    const [range, setRange] = useState<Range>({
        startDate: new Date(),
        endDate: addDays(new Date(), 5),
        key: "selection",
    });

    const handleSelect = (ranges: RangeKeyDict) => {
        const selected = ranges.selection;

        // ✅ Nếu one-way, ép endDate = startDate
        if (tripType === "oneway" && selected.startDate) {
            selected.endDate = selected.startDate;
        }

        setRange(selected);

        if (onChangeDate && selected.startDate) {
            onChangeDate({
                startDate: selected.startDate,
                endDate: tripType === "round" ? selected.endDate ?? selected.startDate : undefined,
            });
        }
    };

    const formatDate = (date?: Date) => (date ? date.toLocaleDateString("vi-VN") : "");

    return (
        <div className="flex flex-col gap-4 w-full max-w-xl bg-white rounded-xl shadow p-4">
            {/* Loại chuyến đi */}
            <div className="flex items-center gap-6 text-[1.4rem] font-medium text-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="tripType"
                        value="oneway"
                        checked={tripType === "oneway"}
                        onChange={() => setTripType("oneway")}
                        className="accent-[var(--cl-pri)]"
                    />
                    <span>One way</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="tripType"
                        value="round"
                        checked={tripType === "round"}
                        onChange={() => setTripType("round")}
                        className="accent-[var(--cl-pri)]"
                    />
                    <span>Round trip</span>
                </label>
            </div>

            {/* Lịch */}
            <DateRange
                onChange={handleSelect}
                moveRangeOnFirstSelection={false}
                ranges={[range]}
                months={tripType === "round" ? 2 : 1}
                direction="horizontal"
                showDateDisplay={false}
                editableDateInputs={false}
            />

            {/* Hiển thị kết quả */}
            <div className="text-[1.3rem] text-gray-700">
                {tripType === "oneway" ? (
                    <p>
                        Ngày đi: <b>{formatDate(range.startDate)}</b>
                    </p>
                ) : (
                    <p>
                        Ngày đi: <b>{formatDate(range.startDate)}</b> – Ngày về:{" "}
                        <b>{formatDate(range.endDate)}</b>
                    </p>
                )}
            </div>
        </div>
    );
}
