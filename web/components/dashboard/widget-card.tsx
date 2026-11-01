import type { ReactNode } from "react";
import { TrayIcon } from "@phosphor-icons/react/ssr";

/**
 * Cangkang kartu widget dashboard: permukaan putih, 1px border, radius 10.
 * Tanpa shadow — elevasi hanya dari border sesuai DESIGN.md.
 */
export function WidgetCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="flex h-full min-w-0 flex-col rounded-md border border-border bg-surface p-4 sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="m-0 text-[13px] font-semibold leading-none text-foreground">
          {title}
        </h2>
        {action}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </section>
  );
}

export function WidgetLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="whitespace-nowrap text-[12px] font-medium text-primary no-underline hover:underline"
    >
      {label}
    </a>
  );
}

export function WidgetEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
      <TrayIcon size={22} aria-hidden="true" className="text-text-3" />
      <p className="m-0 text-[12.5px] text-text-3">{message}</p>
    </div>
  );
}
