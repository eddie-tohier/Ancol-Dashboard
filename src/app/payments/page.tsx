"use client"

import { useState, useMemo } from "react"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import dynamic from "next/dynamic"
import { Search, ChevronLeft, ChevronRight, Wallet, CheckCircle, Eye } from "lucide-react"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING"
type PaymentMethod = "PG" | "VA"
type Gateway = "Midtrans" | "Xendit" | "Doku"

interface Payment {
  id: string
  orderId: string
  customer: string
  amount: number
  method: PaymentMethod
  gateway: Gateway
  status: PaymentStatus
  paidAt: string
  gatewayResponse: string
  callbackLog: string
  settlement: string
  fee: number
  netAmount: number
}

const customers = [
  "Budi Santoso", "Siti Rahmawati", "Ahmad Hidayat", "Dewi Lestari",
  "Rudi Hartono", "Nina Wijaya", "Hendra Gunawan", "Maya Sari",
  "Agus Wijaya", "Rina Amelia", "Bayu Saputra", "Fitri Handayani",
  "Dimas Prayoga", "Putri Ayu", "Adi Susanto",
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generatePayments(count: number): Payment[] {
  const payments: Payment[] = []
  const statuses: PaymentStatus[] = ["SUCCESS", "FAILED", "PENDING"]
  const methods: PaymentMethod[] = ["PG", "VA"]
  const gateways: Gateway[] = ["Midtrans", "Xendit", "Doku"]
  for (let i = 1; i <= count; i++) {
    const amount = Math.floor(Math.random() * 5000000) + 50000
    const fee = Math.floor(amount * (Math.random() * 0.02 + 0.01))
    // eslint-disable-next-line no-constant-binary-expression
    const status = i % 8 === 0 ? randomItem(["FAILED", "PENDING"]) : "SUCCESS"
    payments.push({
      id: `PAY-${String(i).padStart(5, "0")}`,
      orderId: `ORD-${String(Math.floor(Math.random() * 35) + 1).padStart(3, "0")}`,
      customer: randomItem(customers),
      amount,
      method: randomItem(methods),
      gateway: randomItem(gateways),
      status,
      paidAt: status === "SUCCESS" ? `2026-07-${String(i <= 8 ? 5 : Math.floor(Math.random() * 30) + 1).padStart(2, "0")} 10:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}` : "-",
      gatewayResponse: status === "SUCCESS" ? "Transaction approved (00)" : "Transaction declined (05)",
      callbackLog: status === "SUCCESS" ? `Callback received at ${Date.now() - Math.floor(Math.random() * 86400000)}` : "No callback received",
      settlement: status === "SUCCESS" ? `2026-07-${String(Math.floor(Math.random() * 30) + 1).padStart(2, "0")}` : "-",
      fee,
      netAmount: amount - fee,
    })
  }
  return payments
}

const payments = generatePayments(45)

const methodLabel: Record<PaymentMethod, string> = {
  PG: "PG (Midtrans)",
  VA: "Virtual Account",
}

const statusColor: Record<PaymentStatus, string> = {
  SUCCESS: "text-success border-success",
  FAILED: "text-danger border-danger",
  PENDING: "text-warning border-warning",
}

const successTrendOptions: ApexCharts.ApexOptions = {
  chart: { type: "bar", toolbar: { show: false } },
  colors: ["#10B981"],
  xaxis: { categories: Array.from({ length: 30 }, (_, i) => `${i + 1} Jul`), labels: { style: { fontSize: "10px" } } },
  yaxis: { max: 100, labels: { formatter: (v: number) => `${v}%` } },
  plotOptions: { bar: { columnWidth: "60%", borderRadius: 2 } },
  tooltip: { y: { formatter: (v: number) => `${v}%` } },
}

const methodCounts = payments.reduce((acc, p) => {
  acc[p.method] = (acc[p.method] || 0) + 1
  return acc
}, {} as Record<string, number>)

const successRate = Math.round((payments.filter(p => p.status === "SUCCESS").length / payments.length) * 100)

export default function PaymentsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selected, setSelected] = useState<Payment | null>(null)
  const [open, setOpen] = useState(false)
  const pageSize = 15
  const totalPages = Math.ceil(payments.length / pageSize)
  const paginated = useMemo(() => payments.slice((currentPage - 1) * pageSize, currentPage * pageSize), [currentPage])

  const totalRevenue = payments.filter(p => p.status === "SUCCESS").reduce((s, p) => s + p.amount, 0)
  const todayRevenue = payments.filter(p => p.status === "SUCCESS" && p.paidAt.startsWith("2026-07-05")).reduce((s, p) => s + p.amount, 0)

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Payments" />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-lg border border-stroke bg-white px-5 py-4 shadow-default">
          <p className="text-sm font-medium text-body">Revenue Hari Ini</p>
          <p className="mt-1 text-xl font-bold text-[#334155]">Rp {todayRevenue.toLocaleString("id-ID")}</p>
        </div>
        <div className="rounded-lg border border-stroke bg-white px-5 py-4 shadow-default">
          <p className="text-sm font-medium text-body">Revenue Bulan Ini</p>
          <p className="mt-1 text-xl font-bold text-[#334155]">Rp {totalRevenue.toLocaleString("id-ID")}</p>
        </div>
        <div className="rounded-lg border border-stroke bg-white px-5 py-4 shadow-default">
          <p className="text-sm font-medium text-body">Success Rate</p>
          <p className="mt-1 text-xl font-bold text-success">{successRate}%</p>
        </div>
        <div className="rounded-lg border border-stroke bg-white px-5 py-4 shadow-default">
          <p className="text-sm font-medium text-body">Failed Payment</p>
          <p className="mt-1 text-xl font-bold text-danger">{payments.filter(p => p.status === "FAILED").length}</p>
        </div>
        <div className="rounded-lg border border-stroke bg-white px-5 py-4 shadow-default">
          <p className="text-sm font-medium text-body">Pending Payment</p>
          <p className="mt-1 text-xl font-bold text-warning">{payments.filter(p => p.status === "PENDING").length}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="rounded-lg border border-stroke bg-white px-5 py-4 shadow-default">
          <h4 className="mb-3 text-sm font-semibold text-black flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" /> Payment Success Trend
          </h4>
          <ReactApexChart options={successTrendOptions} series={[{ name: "Success Rate", data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 30) + 70) }]} type="bar" height={200} />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-2">
        {(["PG", "VA"] as PaymentMethod[]).map((m) => (
          <div key={m} className="flex items-center justify-between rounded-lg border border-stroke bg-white px-5 py-3 shadow-default">
            <div>
              <p className="text-xs text-body">{methodLabel[m]}</p>
              <p className="text-lg font-bold text-black">{methodCounts[m] || 0}</p>
            </div>
            <Wallet className="h-6 w-6 text-gray-300" />
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-stroke bg-white shadow-default">
        <div className="flex items-center justify-between border-b border-stroke px-5 py-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input placeholder="Cari payment ID, order ID..." className="compact-input w-full !pl-10 pr-3" />
          </div>
          <div className="flex items-center gap-3">
            <select className="compact-input text-sm">
              <option>All Date</option>
            </select>
            <select className="compact-input text-sm">
              <option>All Method</option>
              <option>PG (Midtrans)</option>
              <option>Virtual Account</option>
            </select>
            <select className="compact-input text-sm">
              <option>All Status</option>
              <option>Success</option>
              <option>Failed</option>
              <option>Pending</option>
            </select>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="compact-table w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left">
                <th className="min-w-[130px] xl:pl-11">Payment ID</th>
                <th className="min-w-[110px]">Order ID</th>
                <th className="min-w-[150px]">Customer</th>
                <th className="min-w-[120px]">Amount</th>
                <th className="min-w-[120px]">Payment Method</th>
                <th className="min-w-[90px]">Status</th>
                <th className="min-w-[140px]">Paid At</th>
                <th className="min-w-[90px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p.id} className="hover:bg-gray-1">
                  <td className="border-b border-[#eee] pl-9 xl:pl-11">
                    <span className="font-medium text-black">{p.id}</span>
                  </td>
                  <td className="border-b border-[#eee]">{p.orderId}</td>
                  <td className="border-b border-[#eee]">
                    <span className="text-black">{p.customer}</span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <span className="font-medium text-black">Rp {p.amount.toLocaleString("id-ID")}</span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <span className="text-black">{methodLabel[p.method]}</span>
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
                    <button
                      onClick={() => { setSelected(p); setOpen(true) }}
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
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, payments.length)} of {payments.length}
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
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-4 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-stroke bg-white shadow-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-stroke px-6 py-4">
              <h3 className="text-lg font-semibold text-black">Detail Payment</h3>
              <p className="text-sm text-body">Informasi lengkap transaksi pembayaran</p>
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
                  <p className="font-medium text-black">{selected.customer}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Method</p>
                  <p className="font-medium text-black">{methodLabel[selected.method]}</p>
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
                  <p className="text-gray-500">Settlement</p>
                  <p className="font-medium text-black">{selected.settlement}</p>
                </div>
              </div>

              <div className="border-t border-stroke pt-4">
                <h4 className="text-sm font-semibold text-black mb-2">Gateway Response</h4>
                <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 font-mono">{selected.gatewayResponse}</p>
              </div>

              <div className="border-t border-stroke pt-4">
                <h4 className="text-sm font-semibold text-black mb-2">Callback Log</h4>
                <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 font-mono">{selected.callbackLog}</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded border border-stroke px-6 py-2 text-sm font-medium hover:bg-gray-1"
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
