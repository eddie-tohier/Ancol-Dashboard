"use client"

import { useState, useMemo } from "react"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import { Search, Eye } from "lucide-react"
import { getUnitName } from "@/lib/units"
import StatCard from "@/components/ui/StatCard"
import Pagination from "@/components/ui/Pagination"
import { getTickets } from "@/lib/data"
import type { Ticket } from "@/lib/data"

const tickets = getTickets().data

const statusColor: Record<string, string> = {
  ACTIVE: "text-success border-success",
  USED: "text-gray-400 border-gray-400",
  EXPIRED: "text-danger border-danger",
  REFUND: "text-warning border-warning",
}

const statusLabel: Record<string, string> = {
  ACTIVE: "Active",
  USED: "Used",
  EXPIRED: "Expired",
  REFUND: "Refund",
}

function QrCodeSvg({ id }: { id: string }) {
  const size = 11
  const cells: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => Math.random() > 0.6)
  )

  return (
    <svg width="140" height="140" viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <rect width={size} height={size} fill="white" />
      {cells.map((row, y) =>
        row.map((v, x) => v && <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="black" rx={0.1} />)
      )}
    </svg>
  )
}

export default function TicketsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [open, setOpen] = useState(false)
  const pageSize = 15
  const totalPages = Math.ceil(tickets.length / pageSize)
  const paginated = useMemo(() => tickets.slice((currentPage - 1) * pageSize, currentPage * pageSize), [currentPage])

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Tickets" />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Tickets Sold Today" value={tickets.length} bgImage="/cube-bg_1.jpg" />
        <StatCard label="Pending Ticket" value={tickets.filter(t => t.status === "ACTIVE").length} bgImage="/cube-bg_1.jpg" valueClassName="text-success" />
        <StatCard label="Used Ticket" value={tickets.filter(t => t.status === "USED").length} bgImage="/cube-bg_1.jpg" valueClassName="text-primary" />
        <StatCard label="Expired Ticket" value={tickets.filter(t => t.status === "EXPIRED" || t.status === "REFUND").length} bgImage="/cube-bg_1.jpg" valueClassName="text-danger" />
      </div>

      <div className="rounded-lg border border-stroke bg-white shadow-default">
        <div className="flex items-center justify-between border-b border-stroke px-5 py-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search ticket ID, order ID..." className="compact-input w-full !pl-10 pr-3" />
          </div>
          <span className="text-sm text-gray-500">{tickets.length} tickets</span>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="compact-table w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left">
                <th className="min-w-[130px] xl:pl-11">Ticket ID</th>
                <th className="min-w-[110px]">Order ID</th>
                <th className="min-w-[120px]">Unit</th>
                <th className="min-w-[180px]">Ticket Type</th>
                <th className="min-w-[150px]">Customer</th>
                <th className="min-w-[90px]">Status</th>
                <th className="min-w-[120px]">Valid Until</th>
                <th className="min-w-[100px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((t) => (
                <tr key={t.id} className="hover:bg-gray-1">
                  <td className="border-b border-[#eee] pl-9 xl:pl-11">
                    <span className="font-medium text-black">{t.id}</span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <span className="text-black">{t.orderId}</span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-black">
                      {getUnitName(t.unitId)}
                    </span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <span className="text-black">{t.ticketType}</span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <span className="text-black">{t.customerName}</span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor[t.status]}`}>
                      {statusLabel[t.status]}
                    </span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <span className="text-black">{t.validUntil}</span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <button
                      onClick={() => { setSelected(t); setOpen(true) }}
                      className="inline-flex items-center justify-center rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-1"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={tickets.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          label="tickets"
        />
      </div>

      {open && selected && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-4 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-stroke bg-white shadow-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-stroke px-6 py-4">
              <h3 className="text-lg font-semibold text-black">Ticket Detail</h3>
              <p className="text-sm text-body">Complete customer ticket information</p>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-dashed border-stroke pb-4">
                <div className="shrink-0">
                  <div className="rounded-lg bg-white p-2 shadow-sm border border-stroke">
                    <QrCodeSvg id={selected.id} />
                  </div>
                </div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusColor[selected.status]}`}>
                  {statusLabel[selected.status]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium text-black">{selected.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="font-medium text-black">{selected.orderId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Ticket ID</p>
                  <p className="font-medium text-black font-semibold tracking-wider">{selected.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Ticket Type</p>
                  <p className="font-medium text-black">{selected.ticketType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-black">{selected.customerEmail}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-black">{selected.customerPhone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Unit</p>
                  <p className="font-medium text-black">{getUnitName(selected.unitId)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Valid Until</p>
                  <p className="font-medium text-black">{selected.validUntil}</p>
                </div>
              </div>

              {selected.status === "USED" && selected.usedAt && (
                <div className="border-t border-stroke pt-4">
                  <h4 className="text-sm font-semibold text-black mb-3">
                    Used At
                  </h4>
                  <p className="text-sm font-medium text-black">{selected.usedAt}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded border border-stroke px-6 py-2 text-sm font-medium hover:bg-gray-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  )
}
