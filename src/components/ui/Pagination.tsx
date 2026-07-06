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

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 8

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages - 2, totalPages - 1, totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, 2, 3, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, 2, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages - 1, totalPages)
      }
    }
    return pages
  }

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
        {getPageNumbers().map((pg, idx) => {
          if (pg === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="inline-flex h-8 w-8 items-center justify-center text-sm font-medium text-body"
              >
                ...
              </span>
            )
          }
          return (
            <button
              key={pg}
              onClick={() => onPageChange(pg as number)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded text-sm font-medium ${
                pg === currentPage ? "bg-primary text-white" : "border border-stroke hover:bg-gray-1"
              }`}
            >
              {pg}
            </button>
          )
        })}
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
