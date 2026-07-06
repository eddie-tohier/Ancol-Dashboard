"use client"

import { useState, useEffect, useRef, Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import { Eye, Download } from "lucide-react"
import SearchInput from "@/components/ui/SearchInput"
import Pagination from "@/components/ui/Pagination"
import StatCard from "@/components/ui/StatCard"
import SortableTh from "@/components/ui/SortableTh"
import { getUnitName } from "@/lib/units"
import FilterSortDropdown from "@/components/filters/FilterSortDropdown"
import DateRangeFilter from "@/components/filters/DateRangeFilter"
import PaymentStatusFilter from "@/components/filters/PaymentStatusFilter"
import FloatingFilterBadge from "@/components/filters/FloatingFilterBadge"
import { getOrders, getTicketsByOrder, TODAY } from "@/lib/data"
import type { Order, OrderStatus, OrderItem } from "@/lib/data"

const statuses: OrderStatus[] = ["PAID", "ISSUED", "FAILED", "PENDING"]
const unitIds = ["dfn", "swa", "ods", "awa", "pgu", "jbl"]

const statusColor: Record<OrderStatus, string> = {
  PAID: "text-success border border-success",
  ISSUED: "text-orange-600 border border-orange-600",
  FAILED: "text-danger border border-danger",
  PENDING: "text-warning border border-warning",
}

const orders = getOrders().data

const currencyFormat = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)

function OrdersPageContent() {
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<Order | null>(null)
  const [open, setOpen] = useState(false)
  const [unitFilter, setUnitFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [dateType, setDateType] = useState<"orderDate" | "visitDate">("orderDate")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [filterValue, setFilterValue] = useState("unit_all")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const unit = searchParams.get("unit")
    if (unit && unitIds.includes(unit)) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setUnitFilter(unit)
      setFilterValue(`unit_${unit}`)
    }
  }, [searchParams])

  const availDates = [...new Set(orders.map((o) => o[dateType]))].sort()

  const filteredOrders = orders.filter((o) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!o.id.toLowerCase().includes(q) && !o.customerName.toLowerCase().includes(q) && !o.customerPhone.includes(q)) return false
    }
    if (unitFilter !== "all" && !o.items.some((it) => it.unitId === unitFilter)) return false
    if (statusFilter !== "all" && o.status !== statusFilter) return false
    const d = o[dateType]
    if (dateFrom && d < dateFrom) return false
    if (dateTo && d > dateTo) return false
    return true
  })

  function handleSort(key: string) {
    let newDir = "asc"
    let newKey: string | null = key
    if (sortKey === key) {
      if (sortDir === "asc") { newDir = "desc"; newKey = key }
      else { newKey = null; newDir = "asc" }
    }
    setSortKey(newKey)
    setSortDir(newDir as "asc" | "desc")
    if (newKey) {
      const map: Record<string, string> = {
        id_asc: "orderId_asc", id_desc: "orderId_desc",
        customer_asc: "customer_asc", customer_desc: "customer_desc",
        amount_desc: "amount_highest", amount_asc: "amount_lowest",
        status_asc: "status_asc", status_desc: "status_desc",
        payment_asc: "payment_asc", payment_desc: "payment_desc",
        orderDate_desc: "orderDate_desc", orderDate_asc: "orderDate_asc",
      }
      const fv = map[`${newKey}_${newDir}`]
      if (fv) setFilterValue(fv)
    } else {
      setFilterValue(unitFilter === "all" ? "unit_all" : `unit_${unitFilter}`)
    }
    setCurrentPage(1)
  }

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const key = sortKey || "orderDate"
    const dir = sortKey ? sortDir : "desc"
    let aVal: string | number = "", bVal: string | number = ""
    if (key === "id") { aVal = a.id; bVal = b.id }
    else if (key === "customer") { aVal = a.customerName; bVal = b.customerName }
    else if (key === "phone") { aVal = a.customerPhone; bVal = b.customerPhone }
    else if (key === "amount") { aVal = a.amount; bVal = b.amount }
    else if (key === "status") { aVal = a.status; bVal = b.status }
    else if (key === "payment") { aVal = a.paymentMethod; bVal = b.paymentMethod }
    else if (key === "orderDate") { aVal = a.orderDate; bVal = b.orderDate }
    if (aVal < bVal) return dir === "asc" ? -1 : 1
    if (aVal > bVal) return dir === "asc" ? 1 : -1
    return 0
  })

  const pageSize = 10
  const totalPages = Math.ceil(filteredOrders.length / pageSize)
  const paginatedOrders = sortedOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) +
    (unitFilter !== "all" ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0) +
    (searchQuery ? 1 : 0)

  const thisMonthStats = useMemo(() => {
    const startOfMonth = new Date(TODAY)
    startOfMonth.setDate(1)
    const startOfMonthStr = startOfMonth.toISOString().slice(0, 10)
    
    const thisMonthOrders = orders.filter(
      (o) => o.orderDate >= startOfMonthStr && o.orderDate <= TODAY
    )
    
    const revenue = thisMonthOrders
      .filter((o) => o.status === "PAID" || o.status === "ISSUED")
      .reduce((s, o) => s + o.amount, 0)
      
    const totalOrders = thisMonthOrders.length
    
    const counts = { PAID: 0, ISSUED: 0, FAILED: 0, PENDING: 0 } as Record<OrderStatus, number>
    thisMonthOrders.forEach((o) => { counts[o.status]++ })
    
    return {
      revenue,
      totalOrders,
      paidIssued: counts.PAID + counts.ISSUED,
      failedPending: counts.FAILED + counts.PENDING,
    }
  }, [orders])

  function exportCSV() {
    const dateLabel = dateType === "orderDate" ? "Order Date" : "Visit Date"
    const rows = filteredOrders.map((o) => [
      o.id,
      o.customerName,
      o.customerPhone,
      o.customerEmail || "",
      dateType === "orderDate" ? o.orderDate : o.visitDate,
      dateType === "orderDate" ? o.visitDate : o.orderDate,
      o.items.map((it) => `${it.unitId} ${it.ticketType} x${it.qty}`).join("; "),
      currencyFormat(o.amount),
      o.status,
      o.paymentMethod,
    ])
    const header = ["Order ID", "Customer", "No. WA", "Email", dateLabel, dateType === "orderDate" ? "Visit Date" : "Order Date", "Items", "Amount", "Status", "Payment"]
    const csv = [header.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function getFilterLabel(val: string): string {
    if (val.startsWith("unit_")) {
      const id = val.replace("unit_", "")
      return id === "all" ? "All Units" : getUnitName(id)
    }
    if (val === "orderId_asc") return "Order ID (A-Z)"
    if (val === "orderId_desc") return "Order ID (Z-A)"
    if (val === "customer_asc") return "Customer (A-Z)"
    if (val === "customer_desc") return "Customer (Z-A)"
    if (val === "amount_highest") return "Amount (Highest)"
    if (val === "amount_lowest") return "Amount (Lowest)"
    if (val === "status_asc") return "Status (A-Z)"
    if (val === "status_desc") return "Status (Z-A)"
    if (val === "payment_asc") return "Payment (A-Z)"
    if (val === "payment_desc") return "Payment (Z-A)"
    if (val === "orderDate_desc") return "Order Date (Newest)"
    if (val === "orderDate_asc") return "Order Date (Oldest)"
    return "Filter"
  }

  function onFilterSelect(val: string) {
    setFilterValue(val)
    setDropdownOpen(false)
    setCurrentPage(1)
    if (val.startsWith("unit_")) {
      const id = val.replace("unit_", "")
      setUnitFilter(id)
    } else if (val === "orderId_asc") { setSortKey("id"); setSortDir("asc") }
    else if (val === "orderId_desc") { setSortKey("id"); setSortDir("desc") }
    else if (val === "customer_asc") { setSortKey("customer"); setSortDir("asc") }
    else if (val === "customer_desc") { setSortKey("customer"); setSortDir("desc") }
    else if (val === "amount_highest") { setSortKey("amount"); setSortDir("desc") }
    else if (val === "amount_lowest") { setSortKey("amount"); setSortDir("asc") }
    else if (val === "status_asc") { setSortKey("status"); setSortDir("asc") }
    else if (val === "status_desc") { setSortKey("status"); setSortDir("desc") }
    else if (val === "payment_asc") { setSortKey("payment"); setSortDir("asc") }
    else if (val === "payment_desc") { setSortKey("payment"); setSortDir("desc") }
    else if (val === "orderDate_desc") { setSortKey("orderDate"); setSortDir("desc") }
    else if (val === "orderDate_asc") { setSortKey("orderDate"); setSortDir("asc") }
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Orders This Month" />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Revenue" value={currencyFormat(thisMonthStats.revenue)} bgImage="/cube-bg_1.jpg" />
        <StatCard label="Total Orders" value={thisMonthStats.totalOrders} bgImage="/cube-bg.jpg" />
        <StatCard label="Paid / Issued" value={thisMonthStats.paidIssued} bgImage="/cube-bg_2.jpg" valueClassName="text-success" />
        <StatCard label="Failed / Pending" value={thisMonthStats.failedPending} bgImage="/cube-bg_3.jpg" valueClassName="text-danger" />
      </div>

      {/* Filter Card */}
      <div className="mb-4 rounded-lg border border-stroke bg-white px-5 py-4 shadow-default">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <FilterSortDropdown
              filterValue={filterValue}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              dropdownRef={dropdownRef}
              onFilterSelect={onFilterSelect}
              getFilterLabel={getFilterLabel}
            />
            <PaymentStatusFilter
              statusFilter={statusFilter}
              onStatusChange={(s) => { setStatusFilter(s); setCurrentPage(1) }}
              statuses={statuses}
            />
            <DateRangeFilter
              dateType={dateType}
              onDateTypeChange={setDateType}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              onClearDates={() => { setDateFrom(""); setDateTo("") }}
              onChangePage={() => setCurrentPage(1)}
              availDates={availDates}
            />
          </div>
        </div>
      </div>

      <FloatingFilterBadge
        activeFilterCount={activeFilterCount}
        onClearAll={() => { setSearchQuery(""); setStatusFilter("all"); setUnitFilter("all"); setFilterValue("unit_all"); setSortKey(null); setDateFrom(""); setDateTo(""); setCurrentPage(1) }}
      />

      {/* Table Card */}
      <div className="mb-4 rounded-lg border border-stroke bg-white shadow-default">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stroke px-5 py-3">
          <div className="flex rounded-md border border-stroke p-0.5">
            {(["all", ...unitIds] as const).map((uid) => (
              <button
                key={uid}
                onClick={() => { setUnitFilter(uid); setFilterValue(`unit_${uid}`); setCurrentPage(1) }}
                className={`px-2.5 py-1.5 text-xs rounded ${
                   unitFilter === uid ? "bg-primary text-white" : "text-body hover:text-primary"
                 }`}
              >
                {uid === "all" ? "All" : getUnitName(uid)}
              </button>
            ))}
          </div>
          <SearchInput
            value={searchQuery}
            onChange={(v) => { setSearchQuery(v); setCurrentPage(1) }}
            onClear={() => setCurrentPage(1)}
            placeholder="Search order ID, customer..."
            className="ml-auto"
          />
          <button
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-2 rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-1"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="compact-table w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left">
                <SortableTh label="Order ID" column="id" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="min-w-[110px] xl:pl-11" />
                <SortableTh label="Customer" column="customer" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="min-w-[140px]" />
                <th className="min-w-[130px]">No. WA</th>
                <th className="min-w-[150px]">Unit</th>
                <SortableTh label="Amount" column="amount" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="min-w-[120px]" />
                <SortableTh label="Status" column="status" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="min-w-[100px]" />
                <SortableTh label="Payment" column="payment" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="min-w-[120px]" />
                <SortableTh label="Order Date" column="orderDate" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="min-w-[120px]" />
                <th className="min-w-[120px] whitespace-nowrap">Visit Date</th>
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
                      <span className="text-black">{order.customerName}</span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <span className="text-black">{order.customerPhone}</span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <div className="flex flex-wrap gap-1">
                        {orderUnits.map((uid) => (
                          <span key={uid} className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-black">
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
                      <span className="text-black">{order.paymentMethod}</span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <span className="text-black">{order.orderDate}</span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <span className="text-black">{order.visitDate}</span>
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
                    No orders for this unit
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredOrders.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          label="orders"
        />
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
              <p className="text-sm text-body">Order information for {selected?.customerName}</p>
            </div>
            <div className="p-6.5">
              {selected && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
                    <div>
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="font-medium text-black">{selected.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-black">{selected.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-black">{selected.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Order ID</p>
                      <p className="font-mono font-medium text-black">{selected.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Order Date</p>
                      <p className="font-medium text-black">{selected.orderDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Visit Date</p>
                      <p className="font-medium text-black">{selected.visitDate}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-black">Order Items</h4>
                    <div className="divide-y divide-gray-300 rounded-lg border border-stroke text-sm">
                      {selected.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-black">{item.ticketType}</span>
                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-black">
                              {getUnitName(item.unitId)}
                            </span>

                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-500">×{item.qty}</span>
                            <span className="text-gray-500">{currencyFormat(item.unitPrice)}</span>
                            <span className="font-medium text-black">{currencyFormat(item.qty * item.unitPrice)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-black">Ticket Codes</h4>
                    {(() => {
                      const orderTickets = getTicketsByOrder(selected.id)
                      return orderTickets.length > 0 ? (
                        <div className="space-y-2">
                          {selected.items.map((item, i) => {
                            const itemTickets = orderTickets.filter((t) => t.unitId === item.unitId && t.ticketType === item.ticketType)
                            return itemTickets.length > 0 && (
                              <div key={i} className="flex items-center gap-2">
                                <span className="inline-flex rounded-full border border-stroke px-2 py-0.5 text-xs font-medium text-black shrink-0">
                                  {getUnitName(item.unitId)}
                                </span>
                                <span className="text-xs text-gray-500">({itemTickets.length} tiket)</span>
                                <div className="flex flex-wrap gap-1">
                                  {itemTickets.map((t) => (
                                    <span key={t.id} className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-mono font-semibold text-blue-800">
                                      {t.id}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No tickets yet</p>
                      )
                    })()}
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
                        <span className="font-medium text-black">{selected.paymentMethod}</span>
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

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-body">Loading...</div>}>
      <OrdersPageContent />
    </Suspense>
  )
}
