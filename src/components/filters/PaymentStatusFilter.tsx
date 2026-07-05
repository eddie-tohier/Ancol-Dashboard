"use client"

type OrderStatus = "PAID" | "ISSUED" | "FAILED" | "PENDING"

interface PaymentStatusFilterProps {
  statusFilter: OrderStatus | "all"
  onStatusChange: (status: OrderStatus | "all") => void
  statuses: OrderStatus[]
}

export default function PaymentStatusFilter({
  statusFilter,
  onStatusChange,
  statuses,
}: PaymentStatusFilterProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-body">Payment Status</label>
      <div className="flex rounded-md border border-stroke p-0.5">
        {(["all", ...statuses] as const).map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded ${
              statusFilter === s ? "bg-primary text-white" : "text-body hover:text-primary"
            }`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>
    </div>
  )
}
