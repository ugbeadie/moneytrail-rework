"use client";

import { useCalendar } from "@/contexts/CalendarContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { months } from "@/lib/constants";

export function MonthPickerTab() {
  const { selectedMonth, setSelectedMonth } = useCalendar();

  return (
    <div className="flex justify-between items-center mt-2 mb-2">
      <p className="font-bold text-2xl">Summary</p>

      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
        <SelectTrigger className="max-w-24 cursor-pointer">
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month} value={month} className="cursor-pointer">
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
