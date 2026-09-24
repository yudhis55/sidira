export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 min-w-0 bg-background" style={{ padding: "24px 28px 60px" }}>
      {children}
    </main>
  );
}
