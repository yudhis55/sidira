export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 min-h-0 min-w-0 overflow-y-auto bg-background" style={{ padding: "24px 28px 60px" }}>
      {children}
    </main>
  );
}
