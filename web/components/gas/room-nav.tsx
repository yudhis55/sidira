"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMockRooms } from "@/lib/mock-data";

export function RoomNav() {
  const pathname = usePathname();
  const rooms = getMockRooms();

  return (
    <aside className="w-60 bg-white border-r border-line sticky top-14 h-[calc(100vh-56px)] overflow-y-auto p-4 space-y-1">
      <div className="text-[11px] font-bold text-ink3 uppercase tracking-wider mb-2 px-2">
        Ruangan
      </div>
      
      <div className="space-y-1">
        {rooms.map((room) => {
          const href = `/inventaris/${room.id}`;
          const isActive = pathname === href;
          
          return (
            <Link 
              key={room.id}
              href={href}
              className={`
                flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors
                ${isActive 
                  ? "bg-teal-50 text-teal-700" 
                  : "hover:bg-slate-50 text-slate-700"}
              `}
            >
              <span className="text-lg" aria-hidden="true">{room.icon}</span>
              <div className="flex flex-col flex-1 min-w-0">
                <span className={`text-sm font-semibold truncate ${isActive ? "text-teal-700" : "text-slate-900"}`}>
                  {room.name}
                </span>
                {room.description && (
                  <span className={`text-[11px] truncate ${isActive ? "text-teal-600/80" : "text-slate-500"}`}>
                    {room.description}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
