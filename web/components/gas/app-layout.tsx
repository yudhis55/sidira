import { RoomNav } from "./room-nav";
import { MainContent } from "./main-content";
import { getRooms } from "@/lib/auth/rooms";
import { getUtilMetaList } from "@/lib/auth/utilitas";

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const [rooms, utilitas] = await Promise.all([getRooms(), getUtilMetaList()]);

  return (
    <div className="flex flex-1 items-start">
      <RoomNav rooms={rooms} utilitas={utilitas} />
      <MainContent>{children}</MainContent>
    </div>
  );
}
