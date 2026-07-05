"use client"

import { useState, useMemo } from "react"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import { Search, ChevronLeft, ChevronRight, ScanLine, MapPin, Clock, Undo2, Eye } from "lucide-react"
import { UNITS, getUnitName } from "@/lib/units"

type TicketStatus = "ACTIVE" | "USED" | "EXPIRED" | "REFUND"

interface ScanHistory {
  deviceScan: string
  gateMasuk: string
  waktuDigunakan: string
}

interface Ticket {
  id: string
  orderId: string
  unitId: string
  ticketType: string
  customer: string
  customerEmail: string
  customerPhone: string
  status: TicketStatus
  validUntil: string
  scanHistory: ScanHistory | null
  refundDate: string | null
}

const ticketTypes = [
  "Dufan Regular Weekday", "Dufan Annual Pass", "Dufan Express",
  "Sea World Reguler", "Sea World VIP",
  "Samudra Reguler", "Samudra Fast Track",
  "Atlantis All Ride", "Atlantis Periode", "Atlantis VIP",
  "Pintu Gerahim Ancol", "Ancol Taman Impian Pass",
  "Bird Land Reguler", "Bird Land VIP",
]

const customerData = [
  { name: "Budi Santoso", email: "budi@email.com", phone: "081234567890" },
  { name: "Siti Rahmawati", email: "siti@email.com", phone: "081298765432" },
  { name: "Ahmad Hidayat", email: "ahmad@email.com", phone: "087812345678" },
  { name: "Dewi Lestari", email: "dewi@email.com", phone: "082134567890" },
  { name: "Rudi Hartono", email: "rudi@email.com", phone: "085612345678" },
  { name: "Nina Wijaya", email: "nina@email.com", phone: "081112223334" },
  { name: "Hendra Gunawan", email: "hendra@email.com", phone: "087765432109" },
  { name: "Maya Sari", email: "maya@email.com", phone: "082298765432" },
  { name: "Agus Wijaya", email: "agus@email.com", phone: "081334455667" },
  { name: "Rina Amelia", email: "rina@email.com", phone: "085598765432" },
  { name: "Bayu Saputra", email: "bayu@email.com", phone: "087711223344" },
  { name: "Fitri Handayani", email: "fitri@email.com", phone: "082176543210" },
  { name: "Dimas Prayoga", email: "dimas@email.com", phone: "081245678901" },
  { name: "Putri Ayu", email: "putri@email.com", phone: "085634567890" },
  { name: "Adi Susanto", email: "adi@email.com", phone: "087898765432" },
]

const deviceScans = ["Scanner-01 (Gerbang Utama)", "Scanner-03 (Gerbang Timur)", "Scanner-05 (Gerbang Barat)"]
const gates = ["Gate A", "Gate B", "Gate C", "Gate VIP"]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateTickets(count: number): Ticket[] {
  const tickets: Ticket[] = []
  for (let i = 1; i <= count; i++) {
    const statuses: TicketStatus[] = ["ACTIVE", "USED", "EXPIRED", "REFUND"]
    const day = Math.floor(Math.random() * 30) + 1
    const status = randomItem(statuses)
    const cust = randomItem(customerData)
    tickets.push({
      id: `TKT-${String(i).padStart(5, "0")}`,
      orderId: `ORD-${String(Math.floor(Math.random() * 25) + 1).padStart(3, "0")}`,
      unitId: randomItem(UNITS).id,
      ticketType: randomItem(ticketTypes),
      customer: cust.name,
      customerEmail: cust.email,
      customerPhone: cust.phone,
      status,
      validUntil: `2026-07-${String(Math.min(day + 30, 31)).padStart(2, "0")}`,
      scanHistory: status === "USED" ? {
        deviceScan: randomItem(deviceScans),
        gateMasuk: randomItem(gates),
        waktuDigunakan: `2026-07-${String(day).padStart(2, "0")} 08:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      } : null,
      refundDate: status === "REFUND" ? `2026-07-${String(Math.floor(Math.random() * 15) + 1).padStart(2, "0")}` : null,
    })
  }
  return tickets
}

const tickets = generateTickets(35)

const statusColor: Record<TicketStatus, string> = {
  ACTIVE: "text-success border-success",
  USED: "text-primary border-primary",
  EXPIRED: "text-danger border-danger",
  REFUND: "text-warning border-warning",
}

const statusLabel: Record<TicketStatus, string> = {
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
        <div className="rounded-lg border border-stroke bg-white bg-[url(/cube-bg_1.jpg)] bg-no-repeat bg-[right_bottom] bg-[length:auto_100%] px-5 py-4 shadow-default">
          <p className="text-sm font-medium text-body">Total Tickets Sold Today</p>
          <p className="mt-1 text-2xl font-bold text-[#334155]">{tickets.length}</p>
        </div>
        <div className="rounded-lg border border-stroke bg-white bg-[url(/cube-bg_1.jpg)] bg-no-repeat bg-[right_bottom] bg-[length:auto_100%] px-5 py-4 shadow-default">
          <p className="text-sm font-medium text-body">Pending Ticket</p>
          <p className="mt-1 text-2xl font-bold text-success">{tickets.filter(t => t.status === "ACTIVE").length}</p>
        </div>
        <div className="rounded-lg border border-stroke bg-white bg-[url(/cube-bg_1.jpg)] bg-no-repeat bg-[right_bottom] bg-[length:auto_100%] px-5 py-4 shadow-default">
          <p className="text-sm font-medium text-body">Used Ticket</p>
          <p className="mt-1 text-2xl font-bold text-primary">{tickets.filter(t => t.status === "USED").length}</p>
        </div>
        <div className="rounded-lg border border-stroke bg-white bg-[url(/cube-bg_1.jpg)] bg-no-repeat bg-[right_bottom] bg-[length:auto_100%] px-5 py-4 shadow-default">
          <p className="text-sm font-medium text-body">Expired Ticket</p>
          <p className="mt-1 text-2xl font-bold text-danger">{tickets.filter(t => t.status === "EXPIRED" || t.status === "REFUND").length}</p>
        </div>
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
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-black">
                      {getUnitName(t.unitId)}
                    </span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <span className="text-black">{t.ticketType}</span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <span className="text-black">{t.customer}</span>
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

        <div className="flex items-center justify-between border-t border-stroke px-5 py-3">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, tickets.length)} of {tickets.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-1 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded text-sm font-medium ${
                  page === currentPage ? "bg-primary text-white" : "border border-stroke hover:bg-gray-1"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-1 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
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
                  <p className="font-medium text-black">{selected.customer}</p>
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

              <div className="border-t border-stroke pt-4">
                <h4 className="text-sm font-semibold text-black mb-3 flex items-center gap-1.5">
                  <ScanLine className="h-4 w-4 text-primary" />
                  History Scan
                </h4>
                {selected.scanHistory ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Device: <span className="font-medium text-black">{selected.scanHistory.deviceScan}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <ScanLine className="h-3.5 w-3.5" />
                      <span>Gate: <span className="font-medium text-black">{selected.scanHistory.gateMasuk}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Time: <span className="font-medium text-black">{selected.scanHistory.waktuDigunakan}</span></span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No scan history yet</p>
                )}
              </div>

              <div className="border-t border-stroke pt-4">
                <h4 className="text-sm font-semibold text-black mb-3 flex items-center gap-1.5">
                  <Undo2 className="h-4 w-4 text-warning" />
                  Refund History
                </h4>
                {selected.refundDate ? (
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Refund Date: <span className="font-medium text-black">{selected.refundDate}</span></span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No refund</p>
                )}
              </div>

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
