"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ChecklistFormDialog } from "./checklist-form-dialog";
import type { ChecklistEntry } from "@/lib/auth/checklist";

interface ChecklistCalendarProps {
  roomId: string;
  items: Array<{
    id: number;
    name: string;
    merk?: string;
    model?: string;
    category: string;
    index: number;
  }>;
  entries: ChecklistEntry[];
}

const CONDITION_COLORS = {
  baik: "bg-green-500",
  rr: "bg-yellow-500",
  rb: "bg-red-500",
  ta: "bg-gray-500",
};

export function ChecklistCalendar({ roomId, items, entries }: ChecklistCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<{
    entry?: ChecklistEntry;
    itemId: number;
    itemName: string;
    itemCategory: string;
    itemIndex: number;
    checkDate: string;
    isCreating?: boolean;
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Create calendar grid
  const calendarDays = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const getEntriesForDate = (day: number) => {
    const date = formatDate(day);
    return entries.filter((e) => e.date_key === date);
  };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {monthNames[month]} {year}
        </h3>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-muted">
          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
            <div key={day} className="p-2 text-center font-semibold text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} className="h-32 border-t border-r p-2" />;
            }

            const dateEntries = getEntriesForDate(day);
            const dateStr = formatDate(day);

            return (
              <div key={day} className="h-32 border-t border-r p-2 hover:bg-muted/50 relative">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">{day}</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0"
                    onClick={() => {
                      if (items.length > 0) {
                        setSelectedEntry({
                          itemId: items[0].id,
                          itemName: items[0].name,
                          itemCategory: items[0].category,
                          itemIndex: items[0].index,
                          checkDate: dateStr,
                          isCreating: true,
                        });
                      }
                    }}
                    disabled={items.length === 0}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {dateEntries.slice(0, 3).map((entry) => {
                    const item = items.find((i) => i.id === entry.item_id);
                    return (
                      <div
                        key={entry.item_id}
                        className={`text-xs text-white px-1 py-0.5 rounded truncate cursor-pointer ${CONDITION_COLORS[entry.payload.status]}`}
                        onClick={() =>
                          setSelectedEntry({
                            entry,
                            itemId: entry.item_id,
                            itemName: item?.name || "Item",
                            itemCategory: entry.category,
                            itemIndex: entry.item_index,
                            checkDate: dateStr,
                          })
                        }
                      >
                        {item?.name}
                      </div>
                    );
                  })}
                  {dateEntries.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dateEntries.length - 3} lagi
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        {Object.entries(CONDITION_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${color}`} />
            <span className="capitalize">
              {key === "rr" ? "Rusak Ringan" : key === "rb" ? "Rusak Berat" : key === "ta" ? "Tidak Ada" : key}
            </span>
          </div>
        ))}
      </div>

      {/* Form Dialog */}
      {selectedEntry && (
        <ChecklistFormDialog
          open={!!selectedEntry}
          onOpenChange={(open) => !open && setSelectedEntry(null)}
          entry={selectedEntry.entry}
          roomId={roomId}
          itemId={selectedEntry.itemId}
          itemName={selectedEntry.itemName}
          itemCategory={selectedEntry.itemCategory}
          itemIndex={selectedEntry.itemIndex}
          checkDate={selectedEntry.checkDate}
          isCreating={selectedEntry.isCreating}
          items={items}
        />
      )}
    </div>
  );
}
