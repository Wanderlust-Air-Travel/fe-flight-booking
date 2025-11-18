"use client";

import { useEffect, useState } from "react";
import { DateRange, Calendar, Range, RangeKeyDict } from "react-date-range";
import { addDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import useFightSearchBarStore from "@/app/zustand/storeFightSearchBar";

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

    const { setData } = useFightSearchBarStore();



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

    useEffect(()=>{
        setData({service:tripType})
    },[tripType])


    const formatDate = (date?: Date) =>
        date ? date.toLocaleDateString("vi-VN") : "";

    return (
        <div className="flex flex-col gap-2 w-full  bg-white rounded-md p-4 overflow-hidden">
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
            {tripType === "oneway" ? (

                <Calendar
                    date={range.startDate || new Date()}
                    onChange={(date) => handleOneWaySelect(date as Date)}
                    showDateDisplay={false as any}
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
