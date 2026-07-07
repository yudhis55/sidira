import { RoomNav } from "./room-nav";
import { MainContent } from "./main-content";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen">
      <RoomNav />
      <MainContent>{children}</MainContent>
    </div>
  );
}
