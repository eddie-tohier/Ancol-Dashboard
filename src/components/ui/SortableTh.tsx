"use client"

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"

interface SortableThProps {
  label: string
  column: string
  sortKey: string | null
  sortDir: "asc" | "desc"
  onSort: (column: string) => void
  className?: string
}

export default function SortableTh({ label, column, sortKey, sortDir, onSort, className = "" }: SortableThProps) {
  return (
    <th className={`cursor-pointer select-none ${className}`} onClick={() => onSort(column)}>
      <div className="flex items-center gap-1 whitespace-nowrap">
        {label}
        {sortKey === column ? (
          sortDir === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5 text-orange-600" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 text-orange-600" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />
        )}
      </div>
    </th>
  )
}
