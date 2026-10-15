import type { ReactNode } from "react";

/**
 * Cangkang kartu widget dashboard — menyamakan gaya legend-bar/gstat:
 * putih, border var(--line), radius var(--r).
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
      style={{
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: "var(--r)",
        padding: "16px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <h2
          style={{
            fontSize: "10.5px",
            color: "var(--ink3)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.3px",
            margin: 0,
          }}
        >
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function WidgetLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      style={{
        fontSize: "11.5px",
        fontWeight: 700,
        color: "var(--teal)",
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </a>
  );
}

export function WidgetEmpty({ message }: { message: string }) {
  return (
    <p
      style={{
        fontSize: "12.5px",
        color: "var(--ink3)",
        margin: 0,
        padding: "8px 0",
      }}
    >
      {message}
    </p>
  );
}
