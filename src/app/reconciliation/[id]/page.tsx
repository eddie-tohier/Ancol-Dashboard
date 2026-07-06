"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useState, useMemo } from "react"
import Link from "next/link"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import { Download, Search, ArrowLeft, Eye } from "lucide-react"
import { UNITS, getUnitName } from "@/lib/units"
import { getSessions, getLogs } from "@/lib/data/reconciliation"
import { db } from "@/lib/data/db"

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

const resultBadgeConfig: Record<ResultType, { label: string; color: string; bg: string }> = {
  MATCH: { label: "Match", color: "text-success", bg: "border border-success" },
  TICKET_MISSING: { label: "Ticket Missing", color: "text-warning", bg: "border border-warning" },
  TICKET_QTY_MISMATCH: { label: "Qty Mismatch", color: "text-danger", bg: "border border-danger" },
  PAYMENT_MISMATCH: { label: "Payment Mismatch", color: "text-danger", bg: "border border-danger" },
  ORPHAN_PAYMENT: { label: "Orphan Payment", color: "text-yellow-500", bg: "border border-yellow-500" },
}

function OrderDetailDialog({ order, open, onClose }: { order: OrderItem; open: boolean; onClose: () => void }) {
  const config = resultBadgeConfig[order.result]
  
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
            <div className="flex-shrink-0 border-b border-stroke px-6.5 py-4">
              <h3 className="text-lg font-semibold text-black">Order Detail — {order.orderId}</h3>
              <p className="text-sm text-body">Reconciliation result for {order.customer}</p>
            </div>

            <div className="overflow-y-auto p-6.5">
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

              <div className="mt-6 flex items-center gap-3 border-t border-stroke pt-4">
                <span className="text-sm font-medium text-black">Final Result:</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${config.color} ${config.bg}`}>
                  {config.label}
                </span>
              </div>
            </div>

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
  const searchParams = useSearchParams()
  const date = searchParams.get("date")

  const [activeTab, setActiveTab] = useState<string>("all")
  const [selectedUnit, setSelectedUnit] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOrder, setDialogOrder] = useState<OrderItem | null>(null)

  const session = useMemo(() => getSessions().find((s) => s.id === id), [id])

  const ordersForSession = useMemo(() => {
    if (!session) return []
    
    const hour = parseInt(session.time.split(":")[0], 10)
    const dayOrders = db.orders.filter((o) => o.orderDate === session.date)
    
    const hourOrders = dayOrders.filter((o) => {
      const num = parseInt(o.id.replace("ORD-", ""), 10)
      return num % 24 === hour
    })

    return hourOrders
      .filter((o) => o.items.some((it) => it.unitId === session.unitId))
      .map((o): OrderItem => {
         let result: ResultType = "MATCH"
         if (o.status === "FAILED") result = "PAYMENT_MISMATCH"
         else if (o.status === "PENDING") result = "TICKET_MISSING"
         
         return {
           orderId: o.id,
           customer: o.customerName,
           amount: o.amount,
           paymentMethod: o.paymentMethod,
           ticketType: o.items[0]?.ticketType || "N/A",
           result: result,
           unitId: session.unitId
         }
      })
  }, [session])

  const logs = activeTab === "logs" ? getLogs(id as string) : []
  
  const filteredOrders = useMemo(() => {
     if (activeTab === "logs") return []
     let filtered = ordersForSession
     if (activeTab === "match") filtered = filtered.filter(o => o.result === "MATCH")
     if (activeTab === "mismatch") filtered = filtered.filter(o => ["TICKET_MISSING", "TICKET_QTY_MISMATCH", "PAYMENT_MISMATCH"].includes(o.result))
     if (activeTab === "orphan") filtered = filtered.filter(o => o.result === "ORPHAN_PAYMENT")
     
     return filtered.filter((o) => selectedUnit === "all" || o.unitId === selectedUnit)
        .filter((o) =>
          !searchQuery ||
          o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customer.toLowerCase().includes(searchQuery.toLowerCase())
        )
  }, [activeTab, ordersForSession, selectedUnit, searchQuery])

  if (!session) return <DefaultLayout>Session not found</DefaultLayout>

  const tabs = [
    { key: "all", label: "All" },
    { key: "match", label: "Match" },
    { key: "mismatch", label: "Mismatch" },
    { key: "orphan", label: "Orphan" },
    { key: "logs", label: "Logs" },
  ]

  return (
    <DefaultLayout>
      <Breadcrumb pageName={`Session ${id}`} />

      <Link
        href={`/reconciliation?date=${date}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-body hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reconciliation
      </Link>

      <div className={`mb-6 rounded-lg border border-stroke ${session.status === 'FAILED' ? 'bg-red-50' : 'bg-green-50'}`}>
        <div className="flex items-center gap-4 px-6.5 py-4">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${session.status === 'FAILED' ? 'bg-danger' : 'bg-success'} text-sm font-bold text-white`}>
            {session.status === 'FAILED' ? '!' : '✓'}
          </div>
          <div className="flex-1 text-sm">
            <span className={`font-semibold ${session.status === 'FAILED' ? 'text-red-800' : 'text-green-800'}`}>{session.status}</span>
            <span className="mx-2 text-gray-500">·</span>
            <span className="text-gray-700">{session.date} {session.time}</span>
            <span className="mx-2 text-gray-500">·</span>
            <span className="text-gray-700">Duration: {session.duration}</span>
            <span className="mx-2 text-gray-500">·</span>
            <span className="text-gray-700">Orders: {session.totalOrders}</span>
          </div>
        </div>
      </div>

      {activeTab !== "logs" && (
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
            <button className="inline-flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      )}

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
              {tab.label} {tab.key !== "logs" && `(${filteredOrders.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-stroke bg-white shadow-default">
        <div className="max-w-full overflow-x-auto">
          {activeTab === "logs" ? (
             <table className="compact-table w-full table-auto">
             <thead>
               <tr className="bg-gray-2 text-left">
                 <th className="min-w-[150px] xl:pl-11">Time</th>
                 <th className="min-w-[100px]">Level</th>
                 <th className="min-w-[150px]">Step</th>
                 <th className="min-w-[200px]">Message</th>
               </tr>
             </thead>
             <tbody>
               {logs.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                     No logs found
                   </td>
                 </tr>
               ) : (
                 logs.map((log, i) => (
                   <tr key={i} className="hover:bg-gray-1">
                     <td className="border-b border-[#eee] pl-9 xl:pl-11">
                       {new Date(log.createdAt).toLocaleTimeString()}
                     </td>
                     <td className="border-b border-[#eee]">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            log.level === 'INFO' ? 'text-success bg-green-50' : 
                            log.level === 'ERROR' ? 'text-danger bg-red-50' : 'text-warning bg-yellow-50'
                        }`}>
                            {log.level}
                        </span>
                     </td>
                     <td className="border-b border-[#eee]">{log.step}</td>
                     <td className="border-b border-[#eee]">{log.message}</td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
          ) : (
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
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-black">
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
            </table>
          )}
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
