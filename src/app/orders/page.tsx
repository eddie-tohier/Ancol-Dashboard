"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import { Search, Filter, ChevronsUpDown, ShoppingCart, Wallet, CheckCircle, XCircle, Eye, Download, Calendar } from "lucide-react"
import { UNITS, getUnitName } from "@/lib/units"

type OrderStatus = "PAID" | "ISSUED" | "FAILED" | "PENDING"

interface OrderItem {
  product: string
  qty: number
  unitPrice: number
  total: number
  unitId: string
}

interface Order {
  id: string
  customer: { name: string; phone: string; email: string }
  orderDate: string
  visitDate: string
  amount: number
  status: OrderStatus
  payment: string
  items: OrderItem[]
  tickets: string[]
}

const customers = [
  { name: "Budi Santoso", phone: "081234567890", email: "budi@email.com" },
  { name: "Siti Rahmawati", phone: "081298765432", email: "siti@email.com" },
  { name: "Ahmad Hidayat", phone: "087812345678", email: "ahmad@email.com" },
  { name: "Dewi Lestari", phone: "082134567890", email: "dewi@email.com" },
  { name: "Rudi Hartono", phone: "085612345678", email: "rudi@email.com" },
  { name: "Nina Wijaya", phone: "081112223334", email: "nina@email.com" },
  { name: "Hendra Gunawan", phone: "087765432109", email: "hendra@email.com" },
  { name: "Maya Sari", phone: "082298765432", email: "maya@email.com" },
  { name: "Agus Wijaya", phone: "081334455667", email: "agus@email.com" },
  { name: "Rina Amelia", phone: "085598765432", email: "rina@email.com" },
  { name: "Bayu Saputra", phone: "087711223344", email: "bayu@email.com" },
  { name: "Fitri Handayani", phone: "082176543210", email: "fitri@email.com" },
  { name: "Dimas Prayoga", phone: "081245678901", email: "dimas@email.com" },
  { name: "Putri Ayu", phone: "085634567890", email: "putri@email.com" },
  { name: "Adi Susanto", phone: "087898765432", email: "adi@email.com" },
]

const statuses: OrderStatus[] = ["PAID", "ISSUED", "FAILED", "PENDING"]
const payments = ["VA", "PG"]
const unitProducts: Record<string, { product: string; price: number }[]> = {
  dfn: [
    { product: "Dufan Regular Weekday", price: 272000 },
    { product: "Dufan Annual Pass", price: 497000 },
    { product: "Dufan Express", price: 150000 },
  ],
  swa: [
    { product: "Sea World Reguler", price: 75000 },
    { product: "Sea World VIP", price: 200000 },
  ],
  ods: [
    { product: "Samudra Reguler", price: 75000 },
    { product: "Samudra Fast Track", price: 45000 },
  ],
  awa: [
    { product: "Atlantis All Ride", price: 200000 },
    { product: "Atlantis Periode", price: 100000 },
    { product: "Atlantis VIP", price: 350000 },
  ],
  pgu: [
    { product: "Pintu Gerahim Ancol", price: 32000 },
    { product: "Ancol Taman Impian Pass", price: 100000 },
  ],
  jbl: [
    { product: "Bird Land Reguler", price: 100000 },
    { product: "Bird Land VIP", price: 250000 },
  ],
}

const unitIds = Object.keys(unitProducts)

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateOrders(count: number): Order[] {
  const orders: Order[] = []
  for (let i = 1; i <= count; i++) {
    const id = `ORD-${String(i).padStart(3, "0")}`
    const customer = randomItem(customers)
    const status = randomItem(statuses)
    const payment = randomItem(payments)
    const orderDay = randomInt(1, 28)
    const visitDay = randomInt(orderDay, 30)
    const orderDate = `2026-06-${String(orderDay).padStart(2, "0")}`
    const visitDate = `2026-06-${String(visitDay).padStart(2, "0")}`

    const unitCount = randomInt(1, 3)
    const usedUnits = new Set<string>()
    const items: OrderItem[] = []
    for (let j = 0; j < unitCount; j++) {
      let uid: string
      do { uid = randomItem(unitIds) } while (usedUnits.has(uid))
      usedUnits.add(uid)
      const prod = randomItem(unitProducts[uid])
      const qty = randomInt(1, 4)
      items.push({ product: prod.product, qty, unitPrice: prod.price, total: prod.price * qty, unitId: uid })
    }

    const amount = items.reduce((s, it) => s + it.total, 0)
    const ticketCount = status === "FAILED" || status === "PENDING" ? 0 : items.reduce((s, it) => s + it.qty, 0)
    const ticketStart = (i - 1) * 5 + 1
    const tickets = Array.from({ length: ticketCount }, (_, k) => `TIX-${String(ticketStart + k).padStart(3, "0")}`)

    orders.push({ id, customer, orderDate, visitDate, amount, status, payment, items, tickets })
  }
  return orders
}

const orders = generateOrders(25)

const statusColor: Record<OrderStatus, string> = {
  PAID: "text-success border border-success",
  ISSUED: "text-primary border border-primary",
  FAILED: "text-danger border border-danger",
  PENDING: "text-warning border border-warning",
}

const currencyFormat = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)

function OrdersPageContent() {
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<Order | null>(null)
  const [open, setOpen] = useState(false)
  const [unitFilter, setUnitFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const unit = searchParams.get("unit")
    if (unit && unitIds.includes(unit)) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setUnitFilter(unit)
      setFilterOpen(true)
    }
  }, [searchParams])

  const filteredOrders = orders.filter((o) => {
    if (unitFilter !== "all" && !o.items.some((it) => it.unitId === unitFilter)) return false
    if (statusFilter !== "all" && o.status !== statusFilter) return false
    if (dateFrom && o.orderDate < dateFrom) return false
    if (dateTo && o.orderDate > dateTo) return false
    return true
  })

  const pageSize = 10
  const totalPages = Math.ceil(filteredOrders.length / pageSize)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const totalRevenue = filteredOrders.reduce((s, o) => s + o.amount, 0)
  const counts = { PAID: 0, ISSUED: 0, FAILED: 0, PENDING: 0 } as Record<OrderStatus, number>
  filteredOrders.forEach((o) => { counts[o.status]++ })

  function exportCSV() {
    const rows = filteredOrders.map((o) => [
      o.id,
      o.customer.name,
      o.customer.phone,
      o.customer.email,
      o.orderDate,
      o.visitDate,
      o.items.map((it) => `${it.product} x${it.qty}`).join("; "),
      currencyFormat(o.amount),
      o.status,
      o.payment,
    ])
    const header = ["Order ID", "Customer", "No. WA", "Email", "Order Date", "Visit Date", "Items", "Amount", "Status", "Payment"]
    const csv = [header.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Orders" />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-stroke bg-white bg-[url(/cube-bg.jpg)] bg-no-repeat bg-[right_bottom] bg-[length:auto_100%] px-5 py-4 shadow-default">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-body">Total Orders</p>
            {/* <ShoppingCart className="h-8 w-8 text-gray-300" /> */}
          </div>
          <p className="mt-1 text-2xl font-bold text-[#334155]">{filteredOrders.length}</p>
        </div>
        <div className="rounded-lg border border-stroke bg-white bg-[url(/cube-bg_1.jpg)] bg-no-repeat bg-[right_bottom] bg-[length:auto_100%] px-5 py-4 shadow-default">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-body">Total Revenue</p>
            {/* <Wallet className="h-8 w-8 text-gray-300" /> */}
          </div>
          <p className="mt-1 text-2xl font-bold text-[#334155]">{currencyFormat(totalRevenue)}</p>
        </div>
        <div className="rounded-lg border border-stroke bg-white bg-[url(/cube-bg_2.jpg)] bg-no-repeat bg-[right_bottom] bg-[length:auto_100%] px-5 py-4 shadow-default">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-body">Paid / Issued</p>
            {/* <CheckCircle className="h-8 w-8 text-success" /> */}
          </div>
          <p className="mt-1 text-2xl font-bold text-success">{counts.PAID + counts.ISSUED}</p>
        </div>
        <div className="rounded-lg border border-stroke bg-white bg-[url(/cube-bg_3.jpg)] bg-no-repeat bg-[right_bottom] bg-[length:auto_100%] px-5 py-4 shadow-default">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-body">Failed / Pending</p>
            {/* <XCircle className="h-8 w-8 text-danger" /> */}
          </div>
          <p className="mt-1 text-2xl font-bold text-danger">{counts.FAILED + counts.PENDING}</p>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-stroke bg-white shadow-default">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stroke px-5 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-60">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Cari order ID, customer..."
                className="compact-input w-full !pl-10 pr-3"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-body" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1) }}
                className="compact-input w-36 !pl-3 text-sm"
              />
              <span className="text-body">-</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1) }}
                className="compact-input w-36 !pl-3 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-stroke p-0.5">
              {(["all", ...statuses] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setCurrentPage(1) }}
                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                    statusFilter === s ? "bg-primary text-white" : "text-body hover:text-primary"
                  }`}
                >
                  {s === "all" ? "Semua" : s}
                </button>
              ))}
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center justify-center gap-2 rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-1"
            >
              <Filter className="h-4 w-4" />
              {unitFilter === "all" ? "Unit" : getUnitName(unitFilter)}
              <ChevronsUpDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={exportCSV}
              className="inline-flex items-center justify-center gap-2 rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-1"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {filterOpen && (
          <div className="border-b border-stroke bg-gray-50 px-5 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => { setUnitFilter("all"); setCurrentPage(1) }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  unitFilter === "all" ? "bg-primary text-white" : "bg-gray-100 text-black hover:bg-gray-200"
                }`}
              >
                Semua
              </button>
              {UNITS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { setUnitFilter(u.id); setCurrentPage(1) }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    unitFilter === u.id ? "bg-primary text-white" : "bg-gray-100 text-black hover:bg-gray-200"
                  }`}
                >
                  {u.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-full overflow-x-auto">
          <table className="compact-table w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left">
                <th className="min-w-[110px] xl:pl-11">Order ID</th>
                <th className="min-w-[140px]">Customer</th>
                <th className="min-w-[130px]">No. WA</th>
                <th className="min-w-[120px]">Order Date</th>
                <th className="min-w-[120px]">Visit Date</th>
                <th className="min-w-[150px]">Unit</th>
                <th className="min-w-[120px]">Amount</th>
                <th className="min-w-[100px]">Status</th>
                <th className="min-w-[120px]">Payment</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                const orderUnits = Array.from(new Set(order.items.map((i) => i.unitId)))
                return (
                  <tr key={order.id}>
                    <td className="border-b border-[#eee] pl-9 xl:pl-11">
                      <span className="font-medium text-black">{order.id}</span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <span className="text-black">{order.customer.name}</span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <span className="text-black">{order.customer.phone}</span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <span className="text-black">{order.orderDate}</span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <span className="text-black">{order.visitDate}</span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <div className="flex flex-wrap gap-1">
                        {orderUnits.map((uid) => (
                          <span key={uid} className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-black">
                            {getUnitName(uid)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="border-b border-[#eee]">
                      <span className="text-black">{currencyFormat(order.amount)}</span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <span className="text-black">{order.payment}</span>
                    </td>
                    <td className="border-b border-[#eee] text-right">
                      <button
                        className="inline-flex items-center justify-center rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-1"
                        onClick={() => {
                          setSelected(order)
                          setOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-body">
                    Tidak ada order untuk wahana ini
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={99} />
              </tr>
            </tfoot>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stroke px-5 py-3">
            <p className="text-sm text-body">
              Menampilkan {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredOrders.length)} dari {filteredOrders.length} order
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center rounded border border-stroke px-3 py-1.5 text-sm font-medium disabled:opacity-40 hover:bg-gray-1"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded text-sm font-medium ${
                    pg === currentPage ? "bg-primary text-white" : "border border-stroke hover:bg-gray-1"
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center rounded border border-stroke px-3 py-1.5 text-sm font-medium disabled:opacity-40 hover:bg-gray-1"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-4 w-full max-w-2xl max-h-[90vh] rounded-lg border border-stroke bg-white shadow-default overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-stroke px-6.5 py-4">
              <h3 className="text-lg font-semibold text-black">
                Order Detail — {selected?.id}
              </h3>
              <p className="text-sm text-body">Order information for {selected?.customer.name}</p>
            </div>
            <div className="p-6.5">
              {selected && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                    <div>
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="font-medium text-black">{selected.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-black">{selected.customer.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-black">{selected.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Order ID</p>
                      <p className="font-mono font-medium text-black">{selected.id}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-black">Order Items</h4>
                    <div className="divide-y divide-gray-300 rounded-lg border border-stroke text-sm">
                      {selected.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-black">{item.product}</span>
                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-black">
                              {getUnitName(item.unitId)}
                            </span>

                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-500">×{item.qty}</span>
                            <span className="text-gray-500">{currencyFormat(item.unitPrice)}</span>
                            <span className="font-medium text-black">{currencyFormat(item.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-black">Ticket Codes</h4>
                    {selected.tickets.length > 0 ? (
                      <div className="space-y-2">
                        {selected.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="inline-flex rounded-full border border-stroke px-2 py-0.5 text-xs font-medium text-black shrink-0">
                              {getUnitName(item.unitId)}
                            </span>
                            <span className="text-xs text-gray-500">({item.qty} tiket)</span>
                            <div className="flex flex-wrap gap-1">
                              {Array.from({ length: item.qty }, (_, j) => j).map((j) => (
                                <span key={j} className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-mono font-semibold text-blue-800">
                                  {selected.tickets[item.qty * i + j] || `TIX-???`}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Belum ada tiket</p>
                    )}
                  </div>

                  <div className="divide-y divide-gray-300 rounded-lg border border-stroke text-sm">
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Total Quantity</span>
                        <span className="font-medium text-black">{selected.items.reduce((s, it) => s + it.qty, 0)} tiket</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Total Items</span>
                        <span className="font-medium text-black">{selected.items.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Payment Method</span>
                        <span className="font-medium text-black">{selected.payment}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Payment Status</span>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-medium ${statusColor[selected.status]}`}>
                          {selected.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-500">Total Amount</span>
                      <span className="text-black">{currencyFormat(selected.amount)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-500">Payment Amount</span>
                      <span className={`font-semibold ${
                        (selected.status === "PAID" || selected.status === "ISSUED") ? "text-success" : "text-danger"
                      }`}>
                        {currencyFormat(
                          (selected.status === "PAID" || selected.status === "ISSUED")
                            ? selected.amount
                            : 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  className="inline-flex items-center justify-center rounded border border-stroke px-6 py-2 text-sm font-medium hover:bg-gray-1"
                  onClick={() => setOpen(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-body">Loading...</div>}>
      <OrdersPageContent />
    </Suspense>
  )
}
