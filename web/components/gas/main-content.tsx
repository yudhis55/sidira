export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="p-6 md:p-7 bg-background min-h-[calc(100vh-56px)]">
      {children}
    </main>
  );
}
