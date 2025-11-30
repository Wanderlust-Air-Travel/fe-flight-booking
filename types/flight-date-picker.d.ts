/**
 * Types for FlightDatePicker component
 */

export type TripType = "one_way" | "round_trip";

export interface FlightDatePickerProps {
	onChangeDate?: (data: { startDate: Date; endDate?: Date }) => void;
}

