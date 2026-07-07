import * as React from "react"
import { cn } from "@/lib/utils"

export interface TableColumn {
  key: string
  label: string
  align?: "left" | "right" | "center"
  width?: string
  className?: string
}

export interface TableProps {
  columns: TableColumn[]
  rows: Array<Record<string, React.ReactNode>>
  striped?: boolean
  emptyMessage?: string
  className?: string
}

export function Table({
  columns,
  rows,
  striped = false,
  emptyMessage = "Tidak ada data",
  className,
}: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse", className)}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "border-b border-line px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-ink3",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  (!col.align || col.align === "left") && "text-left"
                )}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-ink3"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                // eslint-disable-next-line react/no-array-index-key
                key={rowIndex}
                className={cn(
                  "hover:bg-line2/50",
                  striped && "even:bg-line2/30"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "border-b border-line2 px-3.5 py-2.5 text-sm text-ink",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      (!col.align || col.align === "left") && "text-left",
                      col.className
                    )}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
