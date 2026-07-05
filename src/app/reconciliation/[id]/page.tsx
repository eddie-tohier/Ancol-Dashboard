"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import { Download, Search, ArrowLeft, Eye } from "lucide-react"
import { UNITS, getUnitName } from "@/lib/units"

type ResultType = "MATCH" | "TICKET_MISSING" | "TICKET_QTY_MISMATCH" | "PAYMENT_MISMATCH" | "ORPHAN_PAYMENT"

interface OrderItem {
  orderId: string
  customer: string
  amount: number
  paymentMethod: string
  ticketType: string
  result: ResultType
  unitId: string
}

const allOrders: OrderItem[] = [
  { orderId: "ORD-7841", customer: "Budi Santoso", amount: 250000, paymentMethod: "PG", ticketType: "Reguler", result: "MATCH", unitId: "dfn" },
  { orderId: "ORD-7842", customer: "Siti Rahma", amount: 375000, paymentMethod: "VA", ticketType: "VIP", result: "MATCH", unitId: "swa" },
  { orderId: "ORD-7843", customer: "Ahmad Fauzi", amount: 150000, paymentMethod: "PG", ticketType: "Reguler", result: "MATCH", unitId: "ods" },
  { orderId: "ORD-7844", customer: "Dewi Lestari", amount: 500000, paymentMethod: "VA", ticketType: "VIP", result: "MATCH", unitId: "awa" },
  { orderId: "ORD-7845", customer: "Rizky Pratama", amount: 125000, paymentMethod: "PG", ticketType: "Reguler", result: "MATCH", unitId: "pgu" },
  { orderId: "ORD-7846", customer: "Nina Wijaya", amount: 300000, paymentMethod: "VA", ticketType: "Reguler", result: "MATCH", unitId: "jbl" },
  { orderId: "ORD-7847", customer: "Hendra Gunawan", amount: 450000, paymentMethod: "PG", ticketType: "VIP", result: "MATCH", unitId: "dfn" },
  { orderId: "ORD-7848", customer: "Maya Sari", amount: 175000, paymentMethod: "VA", ticketType: "Reguler", result: "TICKET_MISSING", unitId: "swa" },
  { orderId: "ORD-7849", customer: "Agus Wijaya", amount: 600000, paymentMethod: "PG", ticketType: "VIP", result: "TICKET_QTY_MISMATCH", unitId: "ods" },
  { orderId: "ORD-7850", customer: "Rina Amelia", amount: 200000, paymentMethod: "VA", ticketType: "Reguler", result: "PAYMENT_MISMATCH", unitId: "awa" },
  { orderId: "ORD-7851", customer: "Bayu Saputra", amount: 225000, paymentMethod: "PG", ticketType: "Reguler", result: "ORPHAN_PAYMENT", unitId: "pgu" },
]

const ordersByTab = {
  all: allOrders,
  match: allOrders.filter((o) => o.result === "MATCH"),
  mismatch: allOrders.filter((o) =>
    ["TICKET_MISSING", "TICKET_QTY_MISMATCH", "PAYMENT_MISMATCH"].includes(o.result)
  ),
  orphan: allOrders.filter((o) => o.result === "ORPHAN_PAYMENT"),
}

const resultBadgeConfig: Record<ResultType, { label: string; color: string; bg: string }> = {
  MATCH: { label: "Match", color: "text-success", bg: "border border-success" },
  TICKET_MISSING: { label: "Ticket Missing", color: "text-warning", bg: "border border-warning" },
  TICKET_QTY_MISMATCH: { label: "Qty Mismatch", color: "text-danger", bg: "border border-danger" },
  PAYMENT_MISMATCH: { label: "Payment Mismatch", color: "text-danger", bg: "border border-danger" },
  ORPHAN_PAYMENT: { label: "Orphan Payment", color: "text-yellow-500", bg: "border border-yellow-500" },
}

function OrderDetailDialog({ order, open, onClose }: { order: OrderItem; open: boolean; onClose: () => void }) {
  const config = resultBadgeConfig[order.result]
  const paidOK = order.result === "MATCH" || order.result === "TICKET_MISSING" || order.result === "TICKET_QTY_MISMATCH"
  const paymentAmount = order.result === "PAYMENT_MISMATCH" ? Math.floor(order.amount * 0.9) : paidOK ? order.amount : 0

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <div
            className="mx-4 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-stroke bg-white shadow-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-stroke px-6.5 py-4">
              <h3 className="text-lg font-semibold text-black">Order Detail — {order.orderId}</h3>
              <p className="text-sm text-body">Reconciliation result for {order.customer}</p>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto p-6.5">
              {/* Customer Detail — 1 row, 4 columns */}
              <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-medium text-black">{order.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Unit</p>
                  <p className="font-medium text-black">{getUnitName(order.unitId)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="font-medium text-black">{order.orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="font-medium text-black">{order.paymentMethod}</p>
                </div>
              </div>

              {/* Payment Check (left) | Ticket Check (right) */}
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {/* Payment Check */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-black">Payment Check</h4>
                  <div className="divide-y divide-gray-300 rounded-lg border border-stroke text-sm">
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-500">{order.paymentMethod === "VA" ? "VA Number" : "PG Transaction ID"}</span>
                      <span className="font-mono text-black">
                        {order.paymentMethod === "VA" ? `8801${order.orderId.replace("ORD-", "")}99` : `TXN-${order.orderId}`}
                      </span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-500">Status</span>
                      <span className="inline-flex rounded-full border border-stroke px-2.5 py-0.5 text-sm font-medium text-success">SETTLEMENT</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-500">Payment Amount</span>
                      <span className={`font-semibold ${paidOK ? "text-success" : "text-danger"}`}>
                        Rp {paymentAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-500">Expected Amount</span>
                      <span className="text-black">Rp {order.amount.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-500">Match Status</span>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-medium ${
                        order.result === "PAYMENT_MISMATCH" || order.result === "ORPHAN_PAYMENT"
                          ? "text-danger border border-danger"
                          : "text-success border border-success"
                      }`}>
                        {order.result === "PAYMENT_MISMATCH" || order.result === "ORPHAN_PAYMENT" ? "Mismatch" : "Matched"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ticket Check */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-black">Ticket Check</h4>
                  <div className="divide-y divide-gray-300 rounded-lg border border-stroke text-sm">
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-500">Ordered Qty</span>
                      <span className="text-black">2</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-500">Issued Qty</span>
                      <span className={order.result === "TICKET_QTY_MISMATCH" ? "font-semibold text-danger" : "text-black"}>
                        {order.result === "TICKET_MISSING" ? 0 : order.result === "TICKET_QTY_MISMATCH" ? 1 : 2}
                      </span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-500">Ticket Type</span>
                      <span className="text-black">{order.ticketType}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-500">Ticket Codes</span>
                      <span className="text-right font-mono text-xs text-black">
                        {order.result === "TICKET_MISSING" ? "—" : "TCK-A001, TCK-A002"}
                      </span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-500">Match Status</span>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-medium ${
                        order.result === "TICKET_MISSING" || order.result === "TICKET_QTY_MISMATCH"
                          ? "text-danger border border-danger"
                          : "text-success border border-success"
                      }`}>
                        {order.result === "TICKET_MISSING" ? "Missing" : order.result === "TICKET_QTY_MISMATCH" ? "Mismatch" : "Matched"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary — full width */}
              <div className="mt-6">
                <h4 className="mb-2 text-sm font-semibold text-black">Order Summary</h4>
                <div className="divide-y divide-gray-300 rounded-lg border border-stroke text-sm">
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="text-black">Rp {order.amount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-500">Payment Status</span>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-medium ${
                       paidOK ? "text-success border border-success" : "text-danger border border-danger"
                    }`}>
                      {paidOK ? "PAID" : order.result === "ORPHAN_PAYMENT" ? "ORPHAN" : "MISMATCH"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Final Result — full width */}
              <div className="mt-6 flex items-center gap-3 border-t border-stroke pt-4">
                <span className="text-sm font-medium text-black">Final Result:</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${config.color} ${config.bg}`}>
                  {config.label}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-stroke p-4">
              <div className="flex justify-end">
                <button
                  className="inline-flex items-center justify-center rounded border border-stroke px-6 py-2 text-sm font-medium hover:bg-gray-1"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default function ReconciliationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<string>("all")
  const [selectedUnit, setSelectedUnit] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOrder, setDialogOrder] = useState<OrderItem | null>(null)

  const filteredOrders = ordersByTab[activeTab as keyof typeof ordersByTab]
    .filter((o) => selectedUnit === "all" || o.unitId === selectedUnit)
    .filter((o) =>
      !searchQuery ||
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const tabs = [
    { key: "all", label: "All" },
    { key: "match", label: "Match" },
    { key: "mismatch", label: "Mismatch" },
    { key: "orphan", label: "Orphan" },
  ]

  return (
    <DefaultLayout>
      <Breadcrumb pageName={`Session ${id}`} />

      <Link
        href="/reconciliation"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-body hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reconciliation
      </Link>

      <div className="mb-6 rounded-lg border border-stroke bg-green-50">
        <div className="flex items-center gap-4 px-6.5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-sm font-bold text-white">
            ✓
          </div>
          <div className="flex-1 text-sm">
            <span className="font-semibold text-green-800 ">Completed</span>
            <span className="mx-2 text-green-700 ">·</span>
            <span className="text-green-700 ">2026-07-03 14:30:22</span>
            <span className="mx-2 text-green-700 ">·</span>
            <span className="text-green-700 ">Duration: 12m 34s</span>
            <span className="mx-2 text-green-700 ">·</span>
            <span className="text-green-700 ">Trigger: Manual</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search orders..."
            className="compact-input w-full !pl-10 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-44">
            <select
              className="compact-input w-full"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
            >
              <option value="all">All Units</option>
              {UNITS.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 rounded-md bg-gray-2 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                activeTab === tab.key
                  ? "bg-white text-black shadow-card"
                  : "text-gray-500 hover:bg-white"
              }`}
            >
              {tab.label} ({filteredOrders.length})
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-stroke bg-white shadow-default">
        <div className="max-w-full overflow-x-auto">
          <table className="compact-table w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left">
                <th className="min-w-[110px] xl:pl-11">Order ID</th>
                <th className="min-w-[150px]">Customer</th>
                <th className="min-w-[120px]">Unit</th>
                <th className="min-w-[120px]">Amount</th>
                <th className="min-w-[120px]">Payment</th>
                <th className="min-w-[100px]">Ticket</th>
                <th>Result</th>
                <th className="min-w-[80px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const config = resultBadgeConfig[order.result]
                  return (
                    <tr key={order.orderId} className="hover:bg-gray-1">
                      <td className="border-b border-[#eee] pl-9 xl:pl-11">
                        <span className="font-medium text-black ">{order.orderId}</span>
                      </td>
                      <td className="border-b border-[#eee] ">{order.customer}</td>
                      <td className="border-b border-[#eee] ">
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-black">
                          {getUnitName(order.unitId)}
                        </span>
                      </td>
                      <td className="border-b border-[#eee] ">
                        Rp {order.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="border-b border-[#eee] ">{order.paymentMethod}</td>
                      <td className="border-b border-[#eee] ">{order.ticketType}</td>
                      <td className="border-b border-[#eee] ">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-medium ${config.color} ${config.bg}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="border-b border-[#eee]">
                        <button
                          onClick={() => setDialogOrder(order)}
                          className="inline-flex items-center justify-center rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-1"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {dialogOrder && (
        <OrderDetailDialog
          order={dialogOrder}
          open={!!dialogOrder}
          onClose={() => setDialogOrder(null)}
        />
      )}
    </DefaultLayout>
  )
}
