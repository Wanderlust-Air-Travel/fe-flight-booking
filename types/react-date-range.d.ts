declare module "react-date-range" {
  import * as React from "react";

  export interface Range {
    startDate?: Date;
    endDate?: Date;
    key?: string;
  }

  export interface RangeKeyDict {
    [key: string]: Range;
  }

  export interface DateRangeProps {
    ranges: Range[];
    onChange: (ranges: RangeKeyDict) => void;
    months?: number;
    direction?: "vertical" | "horizontal";
    moveRangeOnFirstSelection?: boolean;
    showDateDisplay?: boolean;
    editableDateInputs?: boolean;
    className?: string;
    minDate?: Date;
  }

  export interface CalendarProps {
    date?: Date;
    onChange: (date: Date) => void;
    showDateDisplay?: boolean;
    minDate?: Date;
  }

  export class DateRange extends React.Component<DateRangeProps> {}
  export class Calendar extends React.Component<CalendarProps> {}
}
