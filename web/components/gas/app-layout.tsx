import { RoomNav } from "./room-nav";
import { MainContent } from "./main-content";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 min-h-0">
      <RoomNav />
      <MainContent>{children}</MainContent>
    </div>
  );
}
