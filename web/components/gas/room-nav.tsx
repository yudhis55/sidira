"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMockRooms, getMockItems } from "@/lib/mock-data";

export function RoomNav() {
  const pathname = usePathname();
  const rooms = getMockRooms();
  const allItems = getMockItems();

  return (
    <aside className="w-[220px] flex-shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-hidden hover:overflow-y-auto flex flex-col"
      style={{ background: "#0a3d32", borderRight: "1px solid rgba(255,255,255,0.1)" }}>

      {/* Section label */}
      <div className="px-3 pt-2.5 pb-1 text-[9px] font-extrabold tracking-[0.12em] uppercase"
        style={{ color: "rgba(255,255,255,0.35)" }}>
        Ruangan
      </div>

      {/* Room tabs */}
      <div className="flex flex-col gap-px px-2 pb-2">
        {rooms.map((room) => {
          const href = `/inventaris/${room.id}`;
          const isActive = pathname === href;

          const roomItems = allItems.filter((i) => i.room_id === room.id);
          const totalJenis = roomItems.length;
          const totalUnit = roomItems.reduce((s, i) => s + i.quantity, 0);

          return (
            <Link
              key={room.id}
              href={href}
              className="flex items-start gap-2 px-2.5 py-2 rounded-[7px] transition-all duration-150"
              style={{
                borderLeft: isActive ? "3px solid #4eebd0" : "3px solid transparent",
                background: isActive
                  ? "rgba(78,235,208,0.1)"
                  : "transparent",
                color: isActive
                  ? "#4eebd0"
                  : "rgba(255,255,255,0.55)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {/* Icon */}
              <div
                className="w-5 h-5 rounded-[5px] flex items-center justify-center text-[11px] flex-shrink-0"
                style={{
                  background: isActive
                    ? "rgba(78,235,208,0.18)"
                    : "rgba(255,255,255,0.1)",
                }}
              >
                {room.icon}
              </div>

              {/* Info + stats */}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[11.5px] font-semibold truncate leading-tight">
                  {room.name}
                </span>
                {/* Stats row */}
                <div className="flex gap-1.5 mt-1">
                  <div className="text-center rounded px-1.5 py-0.5"
                    style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div className="text-[11px] font-extrabold font-mono"
                      style={{ color: "#4eebd0" }}>
                      {totalJenis}
                    </div>
                    <div className="text-[8px] font-semibold uppercase tracking-wide"
                      style={{ color: "rgba(255,255,255,0.35)" }}>
                      Item
                    </div>
                  </div>
                  <div className="text-center rounded px-1.5 py-0.5"
                    style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div className="text-[11px] font-extrabold font-mono"
                      style={{ color: "#4eebd0" }}>
                      {totalUnit}
                    </div>
                    <div className="text-[8px] font-semibold uppercase tracking-wide"
                      style={{ color: "rgba(255,255,255,0.35)" }}>
                      Unit
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
