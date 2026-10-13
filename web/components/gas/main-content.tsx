export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-w-0 flex-1 bg-background px-4 pb-[60px] pt-4 md:px-7 md:pt-6">
      {children}
    </main>
  );
}
