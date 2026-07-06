"use client"

import { useState, useMemo } from "react"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import dynamic from "next/dynamic"
import Link from "next/link"
import { getSessions } from "@/lib/data/reconciliation"
import { Wallet, CheckCircle, Eye, Download, CreditCard, Building } from "lucide-react"
import StatCard from "@/components/ui/StatCard"
import SearchInput from "@/components/ui/SearchInput"
import Pagination from "@/components/ui/Pagination"
import SortableTh from "@/components/ui/SortableTh"
import { getPayments, getOrders, TODAY } from "@/lib/data"
import type { Payment, PaymentMethod, Order } from "@/lib/data"
import FloatingFilterBadge from "@/components/filters/FloatingFilterBadge"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

const methodLabel: Record<PaymentMethod, string> = {
  PG: "Payment Gateway",
  VA: "Virtual Account",
}

const statusColor: Record<string, string> = {
  SUCCESS: "text-success border-success",
  FAILED: "text-danger border-danger",
  PENDING: "text-warning border-warning",
}

const reconBadgeColors: Record<string, string> = {
  Reconciled: "text-success border-success",
  Failed: "text-danger border-danger",
  Unreconciled: "text-warning border-warning",
  Processing: "text-primary border-primary",
  Orphan: "text-purple-600 border-purple-400",
}

const reconTooltip: Record<string, string> = {
  Reconciled: "Reconciliation session completed. Payment data matched with order.",
  Failed: "Reconciliation session encountered a technical error (e.g. DB failure).",
  Unreconciled: "Order found, but no reconciliation session has processed it yet.",
  Processing: "Reconciliation session is currently running for this time slot.",
  Orphan: "Payment received from gateway, but no matching order found in the system.",
}

const payments = getPayments().data
const orders = getOrders().data
const methodCounts = payments.reduce((acc, p) => {
  acc[p.method] = (acc[p.method] || 0) + 1
  return acc
}, {} as Record<string, number>)

const successTrendOptions: ApexCharts.ApexOptions = {
  chart: { type: "bar", toolbar: { show: false } },
  colors: ["#10B981"],
  xaxis: { categories: Array.from({ length: 30 }, (_, i) => `${i + 1} Jul`), labels: { style: { fontSize: "10px" } } },
  yaxis: { max: 100, labels: { formatter: (v: number) => `${v}%` } },
  plotOptions: { bar: { columnWidth: "60%", borderRadius: 2 } },
  tooltip: { y: { formatter: (v: number) => `${v}%` } },
}

export default function PaymentsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selected, setSelected] = useState<Payment | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortKey, setSortKey] = useState<string | null>("paidAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const pageSize = 15

  const filteredPayments = useMemo(() => {
    let list = [...payments]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.id.toLowerCase().includes(q) || p.orderId.toLowerCase().includes(q) || p.customerName.toLowerCase().includes(q))
    }
    if (methodFilter !== "all") list = list.filter((p) => p.method === methodFilter)
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter)
    if (sortKey) {
      list.sort((a, b) => {
        let aVal: string | number = "", bVal: string | number = ""
        if (sortKey === "id") { aVal = a.id; bVal = b.id }
        else if (sortKey === "orderId") { aVal = a.orderId; bVal = b.orderId }
        else if (sortKey === "customer") { aVal = a.customerName; bVal = b.customerName }
        else if (sortKey === "amount") { aVal = a.amount; bVal = b.amount }
        else if (sortKey === "method") {
          aVal = a.method === "PG" ? `PG (${a.gateway})` : methodLabel[a.method];
          bVal = b.method === "PG" ? `PG (${b.gateway})` : methodLabel[b.method];
        }
        else if (sortKey === "status") { aVal = a.status; bVal = b.status }
        else if (sortKey === "paidAt") { aVal = a.paidAt; bVal = b.paidAt }
        if (aVal < bVal) return sortDir === "asc" ? -1 : 1
        if (aVal > bVal) return sortDir === "asc" ? 1 : -1
        return 0
      })
    }
    return list
  }, [search, methodFilter, statusFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filteredPayments.length / pageSize)
  const paginated = useMemo(() => filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredPayments, currentPage, pageSize])

  const activeFilterCount =
    (methodFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (search ? 1 : 0)

  const thisMonthStats = useMemo(() => {
    const startOfMonth = new Date(TODAY)
    startOfMonth.setDate(1)
    const startOfMonthStr = startOfMonth.toISOString().slice(0, 10)

    const thisMonthPayments = payments.filter((p) => {
      let date = p.paidAt
      if (!date || date === "-") {
        const match = orders.find((o) => o.id === p.orderId)
        date = match ? match.orderDate : TODAY
      }
      return date >= startOfMonthStr && date <= TODAY
    })

    const totalRevenue = thisMonthPayments
      .filter((p) => p.status === "SUCCESS")
      .reduce((s, p) => s + p.amount, 0)

    const successCount = thisMonthPayments.filter((p) => p.status === "SUCCESS").length
    const successRate = thisMonthPayments.length > 0 
      ? Math.round((successCount / thisMonthPayments.length) * 100) 
      : 0

    const failedCount = thisMonthPayments.filter((p) => p.status === "FAILED").length
    const pendingCount = thisMonthPayments.filter((p) => p.status === "PENDING").length

    const methodCounts = { PG: 0, VA: 0 }
    const methodRevenues = { PG: 0, VA: 0 }
    thisMonthPayments.forEach((p) => {
      if (p.method in methodCounts) {
        methodCounts[p.method]++
      }
      if (p.status === "SUCCESS" && p.method in methodRevenues) {
        methodRevenues[p.method] += p.amount
      }
    })

    const totalCount = thisMonthPayments.length

    return {
      totalRevenue,
      successRate,
      failedCount,
      pendingCount,
      methodCounts,
      methodRevenues,
      totalCount,
    }
  }, [])

  const paymentReconStatus = useMemo(() => {
    const sessions = getSessions()
    const statusMap: Record<
      string,
      { status: "Reconciled" | "Unreconciled" | "Failed" | "Processing" | "Orphan"; sessionId?: string; date?: string }
    > = {}
    
    for (const p of payments) {
      const order = orders.find(o => o.id === p.orderId)
      if (!order) {
        // orderId tidak ada di database = Orphan Payment
        statusMap[p.id] = { status: "Orphan" }
        continue
      }
      
      const hour = parseInt(order.id.replace("ORD-", ""), 10) % 24
      const matchSession = sessions.find(s => {
        const sHour = parseInt(s.time.split(":")[0], 10)
        return s.date === order.orderDate && 
               sHour === hour && 
               order.items.some(it => it.unitId === s.unitId)
      })
      
      if (matchSession) {
        if (matchSession.status === "COMPLETED") {
          statusMap[p.id] = { status: "Reconciled", sessionId: matchSession.id, date: matchSession.date }
        } else if (matchSession.status === "FAILED") {
          statusMap[p.id] = { status: "Failed", sessionId: matchSession.id, date: matchSession.date }
        } else {
          statusMap[p.id] = { status: "Unreconciled", sessionId: matchSession.id, date: matchSession.date }
        }
      } else {
        statusMap[p.id] = { status: "Unreconciled" }
      }
    }
    return statusMap
  }, [])

  const todayRevenue = payments.filter(p => p.status === "SUCCESS" && p.paidAt.startsWith(TODAY)).reduce((s, p) => s + p.amount, 0)

  function handleSort(key: string) {
    if (sortKey === key) {
      if (sortDir === "asc") { setSortDir("desc") }
      else { setSortKey(null); setSortDir("asc") }
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setCurrentPage(1)
  }

    return (
    <DefaultLayout>
      <Breadcrumb pageName="Payments This Month" />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Today's Revenue" value={`Rp ${todayRevenue.toLocaleString("id-ID")}`} size="sm" bgImage="/cube-bg.jpg" />
        <StatCard label="Total Revenue" value={`Rp ${thisMonthStats.totalRevenue.toLocaleString("id-ID")}`} size="sm" bgImage="/cube-bg_1.jpg" />
        <StatCard label="Success Rate" value={`${thisMonthStats.successRate}%`} valueClassName="text-success" size="sm" bgImage="/cube-bg_2.jpg" />
        <StatCard label="Failed Payment" value={thisMonthStats.failedCount} valueClassName="text-danger" size="sm" bgImage="/cube-bg_3.jpg" />
        <StatCard label="Pending Payment" value={thisMonthStats.pendingCount} valueClassName="text-warning" size="sm" bgImage="/cube-bg_4.jpg" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column - Success Trend Chart */}
        <div className="xl:col-span-2 rounded-lg border border-stroke bg-white px-5 py-4 shadow-default">
          <h4 className="mb-3 text-sm font-semibold text-black flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" /> Payment Success Trend
          </h4>
          <ReactApexChart options={successTrendOptions} series={[{ name: "Success Rate", data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 30) + 70) }]} type="bar" height={255} />
        </div>

        {/* Right Column - PG & VA Counts */}
        <div className="flex flex-col gap-4">
          {(["PG", "VA"] as PaymentMethod[]).map((m) => {
            const isPG = m === "PG";
            const count = thisMonthStats.methodCounts[m] || 0;
            const revenue = thisMonthStats.methodRevenues[m] || 0;
            const totalCount = thisMonthStats.totalCount || 1;
            const percentage = Math.round((count / totalCount) * 100);

            return (
              <div
                key={m}
                className="flex flex-col justify-between rounded-lg border border-stroke bg-white p-5 shadow-default"
              >
                {/* Header: Title + Share Label */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-body">{methodLabel[m]}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{percentage}% of monthly volume</p>
                  </div>
                  {isPG ? (
                    <CreditCard className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Building className="h-5 w-5 text-slate-400" />
                  )}
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-stroke">
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Transactions</span>
                    <p className="text-base font-bold text-black mt-0.5">{count.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="border-l border-stroke pl-4">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Volume</span>
                    <p className="text-base font-bold text-black mt-0.5">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(revenue)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <FloatingFilterBadge
        activeFilterCount={activeFilterCount}
        onClearAll={() => {
          setMethodFilter("all")
          setStatusFilter("all")
          setSearch("")
          setSortKey("paidAt")
          setSortDir("desc")
          setCurrentPage(1)
        }}
      />

      <div className="rounded-lg border border-stroke bg-white shadow-default">
        <div className="flex items-center justify-between border-b border-stroke px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex rounded-md border border-stroke p-0.5 bg-gray-50">
              {[
                { value: "all", label: "All Method" },
                { value: "PG", label: "Payment Gateway" },
                { value: "VA", label: "Virtual Account" }
              ].map((m) => (
                <button
                  key={m.value}
                  onClick={() => { setMethodFilter(m.value); setCurrentPage(1) }}
                  className={`px-3 py-1.5 text-xs rounded font-medium transition-all ${
                    methodFilter === m.value ? "bg-primary text-white" : "text-body hover:text-primary"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex rounded-md border border-stroke p-0.5 bg-gray-50">
              {[
                { value: "all", label: "All Status" },
                { value: "SUCCESS", label: "Success" },
                { value: "FAILED", label: "Failed" },
                { value: "PENDING", label: "Pending" }
              ].map((s) => (
                <button
                  key={s.value}
                  onClick={() => { setStatusFilter(s.value); setCurrentPage(1) }}
                  className={`px-3 py-1.5 text-xs rounded font-medium transition-all ${
                    statusFilter === s.value ? "bg-primary text-white" : "text-body hover:text-primary"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Search payment ID, order ID..." />
            <button className="inline-flex items-center justify-center gap-2 rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-1">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="compact-table w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left">
                <SortableTh label="Payment ID" column="id" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="min-w-[130px] xl:pl-11" />
                <SortableTh label="Order ID" column="orderId" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="min-w-[110px]" />
                <SortableTh label="Customer" column="customer" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="min-w-[150px]" />
                <SortableTh label="Amount" column="amount" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="min-w-[120px]" />
                <SortableTh label="Payment Method" column="method" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="min-w-[120px]" />
                <th className="min-w-[90px] px-4 py-4 font-medium text-black">Status</th>
                <th className="min-w-[140px] px-4 py-4 font-medium text-black">Paid At</th>
                <th className="min-w-[130px] px-4 py-4 font-medium text-black">Reconciliation</th>
                <th className="min-w-[90px] px-4 py-4 font-medium text-black">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => {
                const recon = paymentReconStatus[p.id] || { status: "Unreconciled" }
                return (
                  <tr key={p.id} className="hover:bg-gray-1">
                    <td className="border-b border-[#eee] pl-9 xl:pl-11">
                      <span className="font-medium text-black">{p.id}</span>
                    </td>
                    <td className="border-b border-[#eee]">{p.orderId}</td>
                    <td className="border-b border-[#eee]">
                      <span className="text-black">{p.customerName}</span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <span className="font-medium text-black">Rp {p.amount.toLocaleString("id-ID")}</span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <span className="text-black">
                        {p.method === "PG" ? `PG (${p.gateway})` : methodLabel[p.method]}
                      </span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <span className="text-black">{p.paidAt}</span>
                    </td>
                    <td className="border-b border-[#eee]">
                      <div className="relative group inline-flex">
                        {recon.sessionId ? (
                          <Link
                            href={`/reconciliation/${recon.sessionId}?date=${recon.date}`}
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold hover:opacity-80 transition-all ${reconBadgeColors[recon.status]}`}
                          >
                            {recon.status}
                          </Link>
                        ) : (
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${reconBadgeColors[recon.status]}`}>
                            {recon.status}
                          </span>
                        )}
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 hidden group-hover:block w-56">
                          <div className="bg-gray-900 text-white text-[11px] leading-relaxed rounded-md px-3 py-2 shadow-lg">
                            {reconTooltip[recon.status]}
                          </div>
                          <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-[#eee]">
                      <button
                        onClick={() => { setSelected(p); setOpen(true) }}
                        className="inline-flex items-center justify-center rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-1"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPayments.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          label="payments"
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
              <h3 className="text-lg font-semibold text-black">Payment Detail</h3>
              <p className="text-sm text-body">Complete payment transaction information</p>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-dashed border-stroke pb-4">
                <div>
                  <p className="text-sm text-gray-500">Payment ID</p>
                  <p className="font-semibold text-black">{selected.id}</p>
                </div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusColor[selected.status]}`}>
                  {selected.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="font-medium text-black">{selected.orderId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium text-black">{selected.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Method</p>
                  <p className="font-medium text-black">
                    {selected.method === "PG" ? `PG (${selected.gateway})` : methodLabel[selected.method]}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Gateway</p>
                  <p className="font-medium text-black">{selected.gateway}</p>
                </div>
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-medium text-black">Rp {selected.amount.toLocaleString("id-ID")}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fee</p>
                  <p className="font-medium text-black">Rp {selected.fee.toLocaleString("id-ID")}</p>
                </div>
                <div>
                  <p className="text-gray-500">Net Amount</p>
                  <p className="font-semibold text-black">Rp {selected.netAmount.toLocaleString("id-ID")}</p>
                </div>
                <div>
                  <p className="text-gray-500">Settlement Date</p>
                  <p className="font-medium text-black">{selected.settlement}</p>
                </div>
                <div className="col-span-2 border-t border-dashed border-stroke pt-3">
                  <p className="text-gray-500">Paid At</p>
                  <p className="font-semibold text-black">
                    {selected.paidAt !== "-" ? selected.paidAt : <span className="text-gray-400">—</span>}
                  </p>
                </div>
              </div>

              <div className="border-t border-stroke pt-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Gateway Response</p>
                  <p className={`text-sm rounded px-3 py-2 font-mono border ${
                    selected.status === "SUCCESS" ? "bg-green-50 border-green-200 text-green-800" :
                    selected.status === "FAILED" ? "bg-red-50 border-red-200 text-red-800" :
                    "bg-yellow-50 border-yellow-200 text-yellow-800"
                  }`}>{selected.gatewayResponse}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Callback Log</p>
                  <p className={`text-xs rounded px-3 py-2 font-mono border break-all ${
                    selected.status === "SUCCESS" ? "bg-gray-50 border-gray-200 text-gray-700" :
                    "bg-gray-50 border-gray-200 text-gray-500"
                  }`}>{selected.callbackLog}</p>
                </div>
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
