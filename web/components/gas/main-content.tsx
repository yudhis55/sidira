export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-w-0 flex-1 bg-background px-5 pb-[60px] pt-5 md:px-7 md:pt-6">
      <div className="mx-auto w-full max-w-[1280px]">{children}</div>
    </main>
  );
}
