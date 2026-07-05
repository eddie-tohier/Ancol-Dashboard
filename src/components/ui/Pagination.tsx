"use client"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  label?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  label = "items",
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t border-stroke px-5 py-3">
      <p className="text-sm text-body">
        Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems} {label}
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="inline-flex items-center rounded border border-stroke px-3 py-1.5 text-sm font-medium disabled:opacity-40 hover:bg-gray-1"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
          <button
            key={pg}
            onClick={() => onPageChange(pg)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded text-sm font-medium ${
              pg === currentPage ? "bg-primary text-white" : "border border-stroke hover:bg-gray-1"
            }`}
          >
            {pg}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="inline-flex items-center rounded border border-stroke px-3 py-1.5 text-sm font-medium disabled:opacity-40 hover:bg-gray-1"
        >
          Next
        </button>
      </div>
    </div>
  )
}
